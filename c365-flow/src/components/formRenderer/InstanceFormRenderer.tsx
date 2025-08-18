import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Button, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { Collapsible } from '../Collapsible';
import { FieldRenderer } from './fields/FieldRenderer';
import { styles } from './styles';
import type { FormSection } from './fields/types';
import { getNestedValue } from './utils/formUtils';
import { useSectionPatchBuffer } from '../../hooks/useSectionPatchBuffer';

type Props = {
  schema: FormSection[];
  data: any;
  editableSections: string[];     // computed from workflow
  readOnlyGlobal?: boolean;
  onPatch: (sectionKey: string, patch: any[]) => Promise<void>;
};

export type InstanceFormRendererRef = {
  flushAll: () => Promise<void>;
  flushSection: (key: string) => Promise<void>;
};

function createEmptySection(section: FormSection): Record<string, any> {
  const obj: Record<string, any> = {};
  for (const f of section.fields) {
    switch (f.type) {
      case 'multiselect':
      case 'imageSelect':
      case 'photo':
        obj[f.key] = [];
        break;
      case 'checkbox':
        obj[f.key] = false;
        break;
      case 'signature':
        obj[f.key] = null;
        break;
      default:
        obj[f.key] = null;
    }
  }
  return obj;
}
const escapePtr = (s: string) => s.replace(/~/g, '~0').replace(/\//g, '~1');

const InstanceFormRenderer = forwardRef<InstanceFormRendererRef, Props>(function InstanceFormRenderer({
  schema, data, editableSections, readOnlyGlobal = false, onPatch
}, ref) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [modalKey, setModalKey] = useState<string|null>(null);
  const idsRef = useRef<Record<string, string[]>>({});

  const { schedule, flushSection, flushAll } = useSectionPatchBuffer({ onFlush: onPatch });

  useImperativeHandle(ref, () => ({ flushAll, flushSection }), [flushAll, flushSection]);

  const ensureIds = (pathKey: string, len: number) => {
    const prev = idsRef.current[pathKey] ?? [];
    const out = prev.slice(0, len);
    while (out.length < len) out.push(uuidv4());
    idsRef.current[pathKey] = out;
    return out;
  };

  const renderFields = (
    fields: FormSection['fields'],
    basePath: (string|number)[],
    row: Record<string, any>,
    sectionKey: string,
    isReadOnly: boolean
  ) => fields.map(f => {
    const fieldPath = [...basePath, f.key];
    const key = fieldPath.join('.');
    if (f.type === 'section') return renderSection(f, fieldPath); // nested

    return (
      <FieldRenderer
        key={key}
        field={f}
        path={fieldPath}
        formState={data}
        localContext={row}
        activeDateKey={null}
        setActiveDateKey={() => {}}
        readOnly={isReadOnly}
        error={undefined}
        registerFieldPosition={() => {}}
        handleChange={async (path, value) => {
          if (isReadOnly) return;
          schedule(sectionKey, path, value);
        }}
      />
    );
  });

  const renderSection = (section: FormSection, path: (string|number)[]) => {
    const sectionKey = String(path[0]);
    const pathKey = path.join('.');
    const sectionReadOnly = readOnlyGlobal || !editableSections.includes(sectionKey);

    // Repeatable
    if (section.repeatable) {
      const entries: Record<string, any>[] = getNestedValue(data, path) ?? [];
      const ids = ensureIds(pathKey, entries.length);

      const addEntry = async () => {
        await flushSection(sectionKey);
        const empty = createEmptySection(section);
        const patch = [{ op: 'add', path: `/${escapePtr(sectionKey)}/-`, value: empty }];
        await onPatch(sectionKey, patch);
      };
      const removeEntry = async (index: number) => {
        await flushSection(sectionKey);
        const patch = [{ op: 'remove', path: `/${escapePtr(sectionKey)}/${index}` }];
        await onPatch(sectionKey, patch);
      };
      const cloneEntry = async (index: number) => {
        await flushSection(sectionKey);
        const orig = entries[index] ?? {};
        const copy: Record<string, any> = { ...orig };
        section.fields.forEach(f => {
          if (f.type === 'photo' || f.type === 'signature' || f.type === 'imageSelect') {
            copy[f.key] = createEmptySection(section)[f.key];
          }
        });
        const patch = [{ op: 'add', path: `/${escapePtr(sectionKey)}/${index+1}`, value: copy }];
        await onPatch(sectionKey, patch);
      };

      return (
        <View key={pathKey} style={styles.sectionContainer}>
          <View style={styles.repeatableHeader}>
            <Text style={styles.sectionLabel}>{section.label}</Text>
            {!sectionReadOnly && <Button title="Add" onPress={addEntry} />}
          </View>

          {entries.map((row, idx) => {
            const entryPath = [...path, idx];
            const entryKey = `${pathKey}.${idx}`;
            const title = `${section.label} ${idx+1}`;

            if (section.useModal) {
              return (
                <View key={ids[idx] ?? entryKey} style={styles.sectionContainer}>
                  <View style={styles.repeatableActions}>
                    <Button title={title} onPress={() => setModalKey(entryKey)} />
                    {!sectionReadOnly && <>
                      <Button title="Copy" onPress={() => cloneEntry(idx)} />
                      <Button title="Remove" onPress={() => removeEntry(idx)} />
                    </>}
                  </View>
                  {modalKey === entryKey && (
                    <Modal transparent visible onRequestClose={() => setModalKey(null)}>
                      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalKey(null)}>
                        <View style={styles.modalContent}>
                          <ScrollView>
                            {renderFields(section.fields, entryPath, row, sectionKey, sectionReadOnly)}
                            {!sectionReadOnly && <Button title="Close" onPress={() => setModalKey(null)} />}
                          </ScrollView>
                        </View>
                      </TouchableOpacity>
                    </Modal>
                  )}
                </View>
              );
            }

            return (
              <Collapsible
                key={ids[idx] ?? entryKey}
                title={title}
                isOpen={!!expandedSections[entryKey]}
                onToggle={(open) => setExpandedSections(prev => ({ ...prev, [entryKey]: open }))}
                hasError={false}
                onLayout={() => {}}
              >
                <View style={styles.sectionContent}>
                  {!sectionReadOnly && (
                    <View style={styles.repeatableActions}>
                      <Button title="Copy" onPress={() => cloneEntry(idx)} />
                      <Button title="Remove" onPress={() => removeEntry(idx)} />
                    </View>
                  )}
                  {renderFields(section.fields, entryPath, row, sectionKey, sectionReadOnly)}
                </View>
              </Collapsible>
            );
          })}
        </View>
      );
    }

    // Non-repeatable
    const row: Record<string, any> = getNestedValue(data, path) ?? {};
    if (section.useModal) {
      return (
        <View key={pathKey} style={styles.sectionContainer}>
          <Button title={section.label} onPress={() => setModalKey(pathKey)} />
          {modalKey === pathKey && (
            <Modal transparent visible onRequestClose={() => setModalKey(null)}>
              <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalKey(null)}>
                <View style={styles.modalContent}>
                  <Text style={styles.sectionLabel}>{section.label}</Text>
                  <ScrollView>{renderFields(section.fields, path, row, sectionKey, sectionReadOnly)}</ScrollView>
                  {!sectionReadOnly && <Button title="Close" onPress={() => setModalKey(null)} />}
                </View>
              </TouchableOpacity>
            </Modal>
          )}
        </View>
      );
    }

    return (
      <Collapsible
        key={pathKey}
        title={section.label}
        isOpen={!!expandedSections[pathKey]}
        onToggle={(open) => setExpandedSections(prev => ({ ...prev, [pathKey]: open }))}
        hasError={false}
        onLayout={() => {}}
      >
        {renderFields(section.fields, path, row, sectionKey, sectionReadOnly)}
      </Collapsible>
    );
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
      {schema.map(section => renderSection(section, [section.key]))}
    </ScrollView>
  );
});

export default InstanceFormRenderer;
