import React, { useRef, useState } from "react";
import { Modal, TouchableOpacity, View } from "react-native";
import { Button, Text } from "react-native-paper";
import type { FieldComponentProps } from "../types";

let SignatureCanvas: any;
try {
  SignatureCanvas = require("react-native-signature-canvas").default;
} catch {}

export function SignatureField({
  field,
  value,
  onChange,
  onLayout,
  readOnly,
}: FieldComponentProps<string | null>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<any>(null);

  if (!SignatureCanvas) {
    return (
      <View onLayout={onLayout} style={{ marginBottom: 8 }}>
        {field.label && <Text style={{ marginBottom: 4 }}>{field.label}</Text>}
        <Button mode="outlined" disabled>
          Signature control unavailable
        </Button>
      </View>
    );
  }

  return (
    <View onLayout={onLayout} style={{ marginBottom: 8 }}>
      {field.label && <Text style={{ marginBottom: 4 }}>{field.label}</Text>}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button
          mode="outlined"
          onPress={() => !readOnly && setOpen(true)}
          disabled={readOnly}
        >
          {value ? "Edit Signature" : "Add Signature"}
        </Button>
        {value && (
          <Button
            mode="text"
            onPress={() => onChange(null)}
            disabled={readOnly}
          >
            Clear
          </Button>
        )}
      </View>

      {open && (
        <Modal transparent animationType="fade">
          <TouchableOpacity
            activeOpacity={1}
            style={{
              flex: 1,
              backgroundColor: "#0009",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                padding: 12,
                height: 400,
              }}
            >
              <SignatureCanvas
                ref={ref}
                onOK={(dataUrl: string) => {
                  onChange(dataUrl);
                  setOpen(false);
                }}
                onEmpty={() => setOpen(false)}
                descriptionText="Sign"
                clearText="Clear"
                confirmText="Save"
                webStyle={
                  ".m-signature-pad--footer { display: flex; gap: 8px; }"
                }
                autoClear={false}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}
