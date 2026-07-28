import { useState } from 'react';
import { Menu, TextInput, TouchableRipple } from 'react-native-paper';

// A read-only TextInput that opens a Menu of options — Paper has no native <Select>,
// so this is the standard pattern used wherever the web app has a dropdown (accountType,
// provider, linkedBankAccount, year picker, etc).
const SelectField = ({ label, value, options, onSelect, getLabel = (o) => o.label, getValue = (o) => o.value }) => {
  const [visible, setVisible] = useState(false);
  const selected = options.find((o) => getValue(o) === value);

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        <TouchableRipple onPress={() => setVisible(true)}>
          <TextInput
            label={label}
            value={selected ? getLabel(selected) : ''}
            mode="outlined"
            editable={false}
            pointerEvents="none"
            right={<TextInput.Icon icon="chevron-down" />}
            style={{ backgroundColor: '#FFFFFF' }}
          />
        </TouchableRipple>
      }
    >
      {options.map((o) => (
        <Menu.Item
          key={String(getValue(o))}
          title={getLabel(o)}
          onPress={() => {
            onSelect(getValue(o));
            setVisible(false);
          }}
        />
      ))}
    </Menu>
  );
};

export default SelectField;
