import React, { useState } from "react";
import { FAB } from "react-native-paper";
import { FormDefinition } from "../api/formsApi";

interface Props {
  templates: FormDefinition[];
  onSelect: (tpl: FormDefinition) => void;
}

export default function FloatingCreateFab({ templates, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  return (
    templates && (
      <FAB.Group
        open={open}
        visible
        icon={open ? "close" : "plus"}
        actions={templates.map((t) => ({
          icon: "file-plus",
          label: t.name || t.formType,
          onPress: () => onSelect(t),
        }))}
        onStateChange={({ open }) => setOpen(open)}
      />
    )
  );
}
