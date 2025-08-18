import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import { Appbar, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import { v4 as uuidv4 } from 'uuid';
import { applyPatch } from 'fast-json-patch';

import InstanceFormRenderer, { InstanceFormRendererRef } from '../components/formRenderer/InstanceFormRenderer';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { getToken } from '../services/authService';
import { getFormTemplates, getInstance, saveSection, transitionInstance } from '../api/formsApi';
import { getInstanceSmart, resolveToServerId } from '../offline/getInstanceSmart';

export default function FormInstanceScreen({ route, navigation }: any) {
  const { id: routeId } = route.params;
  const [id, setId] = useState<any>(routeId);
  const [instance, setInstance] = useState<any>(null);
  const [defs, setDefs] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const isOnline = useNetworkStatus();
  const queueKey = `queue:form:${id}`;
  const rendererRef = useRef<InstanceFormRendererRef>(null);

  // Load roles from JWT
  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) return;
      try {
        const decoded = jwtDecode<{ ['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']?: string[] }>(token);
        const roles = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || [];
        setUserRoles(Array.isArray(roles) ? roles : [roles].filter(Boolean));
      } catch {}
    })();
  }, []);

  // Load instance + templates (workflow)
  useEffect(() => {
    (async () => {
      const [inst, templates] = await Promise.all([getInstanceSmart(id), getFormTemplates()]);
      setInstance(inst);
      setDefs(templates);
      const resolved = await resolveToServerId(id);
      if (resolved !== id) {
        // move queued patches to server id
        const oldKey = `queue:form:${id}`;
        const newKey = `queue:form:${resolved}`;
        const q = await AsyncStorage.getItem(oldKey);
        if (q) { await AsyncStorage.multiSet([[newKey, q]]); await AsyncStorage.removeItem(oldKey); }
        setId(resolved);
      }
    })().catch(e => Alert.alert('Load failed', String(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId]);

  const def = useMemo(() => {
    if (!instance || !defs.length) return null;
    return defs.find((d: any) => d.formDefinitionId === instance.formDefinitionId) ||
           defs.find((d: any) => d.formType === instance.formType) || null;
  }, [instance, defs]);

  const workflow = def?.workflow || {};
  const schema = def?.schema || [];

  const editableSections: string[] = useMemo(() => {
    const secs = Array.isArray(workflow.sections) ? workflow.sections : [];
    return secs
      .filter((s: any) =>
        (!Array.isArray(s.visibleIn) || s.visibleIn.includes(instance?.currentState)) &&
        Array.isArray(s.rolesCanEdit) && s.rolesCanEdit.some((r: string) => userRoles.includes(r))
      )
      .map((s: any) => s.key);
  }, [workflow, instance, userRoles]);

  const availableTransitions = useMemo(() => {
    const t = Array.isArray(workflow.transitions) ? workflow.transitions : [];
    return t.filter((x: any) =>
      (x.from ? x.from === instance?.currentState : true) &&
      (!Array.isArray(x.roles) || x.roles.some((r: string) => userRoles.includes(r)))
    );
  }, [workflow, instance, userRoles]);

  async function enqueueSave(item: any) {
    const raw = await AsyncStorage.getItem(queueKey);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push(item);
    await AsyncStorage.setItem(queueKey, JSON.stringify(arr));
  }

  // Drain queue when online
  useEffect(() => {
    if (!isOnline) return;
    (async () => {
      const raw = await AsyncStorage.getItem(queueKey);
      let queue = raw ? (JSON.parse(raw) as any[]) : [];
      while (queue.length) {
        const item = queue[0];
        try {
          const updated = await saveSection({ id, ...item });
          queue.shift();
          await AsyncStorage.setItem(queueKey, JSON.stringify(queue));
          setInstance({ ...updated, data: updated.data, currentState: updated.state, etag: updated.etag });
        } catch (e: any) {
          if (e.message === 'Version conflict') {
            const latest = await getInstance(id);
            setInstance(latest);
            item.etag = latest.etag;
            await AsyncStorage.setItem(queueKey, JSON.stringify(queue));
          } else {
            break; // stop draining this instance for now
          }
        }
      }
    })().catch(()=>{});
  }, [isOnline, id, queueKey]); // eslint-disable-line

  // onPatch: optimistic apply + online/offline save
  async function onPatch(sectionKey: string, patch: any[]) {
    if (!instance) return;
    // optimistic local apply
    try {
      const nextDoc = applyPatch(instance.data || {}, patch, /*validate*/ false).newDocument;
      setInstance((prev: any) => ({ ...prev, data: nextDoc }));
    } catch {}

    const idem = uuidv4();

    if (isOnline && editableSections.includes(sectionKey) && !String(id).startsWith('tmp_')) {
      try {
        const updated = await saveSection({ id, sectionKey, patch, etag: instance.etag, idempotencyKey: idem });
        setInstance({ ...updated, data: updated.data, currentState: updated.state, etag: updated.etag });
      } catch (e: any) {
        if (e.message === 'Version conflict') {
          const latest = await getInstance(id);
          setInstance(latest);
          Alert.alert('Updated', 'This form was updated elsewhere. Showing latest.');
        } else {
          Alert.alert('Save failed', String(e));
        }
      }
    } else {
      await enqueueSave({ sectionKey, patch, etag: instance.etag, idempotencyKey: idem });
    }
  }

  async function handleTransition(transitionKey: string) {
    if (!instance) return;
    // ensure debounced edits are flushed
    await rendererRef.current?.flushAll();
    if (String(id).startsWith('tmp_')) {
      Alert.alert('Pending sync', 'This form is offline-only right now. Try again when online.');
      return;
    }
    try {
      const res = await transitionInstance({ id, transitionKey, etag: instance.etag });
      setInstance(res);
    } catch (e: any) {
      if (e.message === 'Version conflict') {
        const latest = await getInstance(id);
        setInstance(latest);
        Alert.alert('Updated', 'Version conflict. Reloaded latest.');
      } else {
        Alert.alert('Transition failed', String(e));
      }
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={def?.name ?? 'Form'} subtitle={`${instance?.currentState ?? ''} • v${instance?.version ?? ''}`} />
      </Appbar.Header>

      <InstanceFormRenderer
        ref={rendererRef}
        schema={schema}
        data={instance?.data || {}}
        editableSections={editableSections}
        onPatch={onPatch}
      />

      <View style={{ padding: 12 }}>
        {availableTransitions.map((t: any) => (
          <Button key={t.key} mode="contained" style={{ marginBottom: 8 }} onPress={() => handleTransition(t.key)}>
            {t.key}
          </Button>
        ))}
      </View>
    </View>
  );
}
