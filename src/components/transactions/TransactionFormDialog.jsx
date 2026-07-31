import { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { View, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Portal, Modal, Text, TextInput, IconButton, Button, Chip, Menu, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { listSubcategories } from '../../api/subcategoryApi';
import { brand } from '../../theme/theme';

const TYPE_META = {
  expense: { label: 'Expense', icon: 'trending-down', color: '#EF4444' },
  income: { label: 'Income', icon: 'trending-up', color: '#22C55E' },
  transfer: { label: 'Transfer', icon: 'swap-horizontal', color: '#3B82F6' },
  adjustment: { label: 'Adjustment', icon: 'tune', color: '#F59E0B' },
  opening_balance: { label: 'Opening Balance', icon: 'wallet-outline', color: brand.navy },
};

const PAYMENT_META = {
  cash: { label: 'Cash', icon: 'cash' },
  bank: { label: 'Bank', icon: 'bank-outline' },
  upi: { label: 'UPI', icon: 'qrcode' },
  card: { label: 'Card', icon: 'credit-card-outline' },
  other: { label: 'Other', icon: 'dots-horizontal' },
};

const ALLOCATION_LABEL = {
  UNALLOCATED: { label: '🔴 Unallocated', color: '#EF4444' },
  PARTIALLY_ALLOCATED: { label: '🟡 Partially Allocated', color: '#F59E0B' },
  FULLY_ALLOCATED: { label: '🟢 Fully Allocated', color: '#22C55E' },
};

const emptyDefaults = {
  type: 'expense',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  paymentMethod: 'bank',
  category: '',
  subcategory: '',
  direction: 'decrease',
  bankAccount: '',
  upiAccount: '',
  note: '',
  fromType: 'bank',
  fromBankAccount: '',
  toType: 'bank',
  toBankAccount: '',
};

const toFormValues = (txn, presetType) => {
  if (!txn) return { ...emptyDefaults, type: presetType || emptyDefaults.type };
  return {
    type: txn.type,
    amount: String(txn.amount),
    date: new Date(txn.date).toISOString().slice(0, 10),
    paymentMethod: txn.paymentMethod || 'bank',
    category: txn.category?._id || '',
    subcategory: txn.subcategory?._id || '',
    direction: txn.direction || 'decrease',
    bankAccount: txn.bankAccount?._id || '',
    upiAccount: txn.upiAccount?._id || '',
    note: txn.note || '',
    fromType: txn.transferFrom?.type || 'bank',
    fromBankAccount: txn.transferFrom?.bankAccount?._id || '',
    toType: txn.transferTo?.type || 'bank',
    toBankAccount: txn.transferTo?.bankAccount?._id || '',
  };
};

const Tile = ({ label, icon, selected, color, onPress, style }) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.tile,
      { borderColor: selected ? color : '#E2E8F0', backgroundColor: selected ? color : 'transparent' },
      style,
    ]}
  >
    <MaterialCommunityIcons name={icon} size={18} color={selected ? '#fff' : '#64748B'} />
    <Text variant="labelSmall" style={{ color: selected ? '#fff' : '#64748B', fontWeight: '600', marginTop: 4, textAlign: 'center' }}>
      {label}
    </Text>
  </Pressable>
);

const SectionLabel = ({ children, action }) => (
  <View style={styles.sectionLabelRow}>
    <Text variant="labelMedium" style={styles.sectionLabel}>
      {children}
    </Text>
    {action}
  </View>
);

const PickerField = ({ label, value, options, onSelect, disabled }) => {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);
  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchor={
        <TextInput
          label={label}
          value={selectedOption?.label || ''}
          mode="outlined"
          editable={false}
          disabled={disabled}
          onPressIn={() => !disabled && setOpen(true)}
          right={<TextInput.Icon icon="menu-down" onPress={() => !disabled && setOpen(true)} />}
          style={styles.input}
        />
      }
    >
      {options.map((o) => (
        <Menu.Item
          key={o.value}
          title={o.label}
          onPress={() => {
            onSelect(o.value);
            setOpen(false);
          }}
        />
      ))}
    </Menu>
  );
};

// Mirrors frontend/src/components/transactions/TransactionFormDialog.jsx — one form
// covering income/expense/transfer/adjustment/opening-balance, with a live allocation
// preview badge over the Classify section. Full-screen modal rather than a small
// dialog, since it has the most fields of anything in the app.
const TransactionFormDialog = ({ open, onClose, onSubmit, initialValues, presetType, categories, bankAccounts, upiAccounts }) => {
  const isEdit = Boolean(initialValues);
  const [subcategories, setSubcategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: emptyDefaults });

  const type = watch('type');
  const paymentMethod = watch('paymentMethod');
  const category = watch('category');
  const subcategory = watch('subcategory');
  const fromType = watch('fromType');
  const toType = watch('toType');

  useEffect(() => {
    if (open) reset(toFormValues(initialValues, presetType));
  }, [open, initialValues, presetType, reset]);

  const loadSubcategories = useCallback(async (categoryId) => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    const { data } = await listSubcategories({ category: categoryId });
    setSubcategories(data.data);
  }, []);

  useEffect(() => {
    loadSubcategories(category);
    if (!isEdit || category !== initialValues?.category?._id) {
      setValue('subcategory', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const classifiable = type === 'income' || type === 'expense';
  const filteredCategories = categories.filter((c) => c.type === type);
  const setCount = classifiable ? 1 + (category ? 1 : 0) + (subcategory ? 1 : 0) : 3;
  const livePreview = !classifiable ? 'FULLY_ALLOCATED' : setCount === 3 ? 'FULLY_ALLOCATED' : setCount === 0 ? 'UNALLOCATED' : 'PARTIALLY_ALLOCATED';

  const submitHandler = async (values) => {
    const payload = {
      type: values.type,
      amount: Number(values.amount),
      date: values.date,
      note: values.note || undefined,
    };

    if (values.type === 'transfer') {
      payload.transferFrom = {
        type: values.fromType,
        bankAccount: values.fromType === 'bank' ? values.fromBankAccount : undefined,
      };
      payload.transferTo = {
        type: values.toType,
        bankAccount: values.toType === 'bank' ? values.toBankAccount : undefined,
      };
    } else {
      payload.paymentMethod = values.paymentMethod;
      if (values.paymentMethod === 'bank' && values.bankAccount) payload.bankAccount = values.bankAccount;
      if (values.paymentMethod === 'upi' && values.upiAccount) payload.upiAccount = values.upiAccount;
      if (values.type === 'adjustment') payload.direction = values.direction;
      if (classifiable) {
        if (values.category) payload.category = values.category;
        if (values.subcategory) payload.subcategory = values.subcategory;
      }
    }

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  const accentColor = TYPE_META[type]?.color || brand.navy;

  return (
    <Portal>
      <Modal visible={open} onDismiss={onClose} contentContainerStyle={styles.modal}>
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
        <View style={styles.header}>
          <View>
            <Text variant="titleMedium" style={{ fontWeight: '700' }}>
              {isEdit ? 'Edit Transaction' : 'Add Transaction'}
            </Text>
            {isEdit && initialValues?.allocationStatus && (
              <Chip
                compact
                style={{ marginTop: 4, alignSelf: 'flex-start' }}
                textStyle={{ fontSize: 11 }}
              >
                {ALLOCATION_LABEL[initialValues.allocationStatus]?.label}
              </Chip>
            )}
          </View>
          <IconButton icon="close" size={20} onPress={onClose} disabled={submitting} />
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <View style={styles.tileRow}>
                  {Object.entries(TYPE_META).map(([val, meta]) => (
                    <Tile
                      key={val}
                      label={meta.label}
                      icon={meta.icon}
                      color={meta.color}
                      selected={value === val}
                      onPress={() => onChange(val)}
                    />
                  ))}
                </View>
              )}
            />

            <View style={styles.row}>
              <Controller
                control={control}
                name="amount"
                rules={{ required: 'Amount is required' }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="Amount"
                    value={value}
                    onChangeText={onChange}
                    mode="outlined"
                    keyboardType="numeric"
                    left={<TextInput.Affix text="₹" />}
                    error={!!errors.amount}
                    style={[styles.input, { flex: 1 }]}
                  />
                )}
              />
              <Controller
                control={control}
                name="date"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="Date"
                    value={value}
                    onChangeText={onChange}
                    mode="outlined"
                    placeholder="YYYY-MM-DD"
                    style={[styles.input, { width: 140 }]}
                  />
                )}
              />
            </View>

            {type === 'adjustment' && (
              <View>
                <SectionLabel>Direction</SectionLabel>
                <Controller
                  control={control}
                  name="direction"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.rowGap}>
                      <Tile
                        label="Increase balance"
                        icon="arrow-up-bold"
                        color="#22C55E"
                        selected={value === 'increase'}
                        onPress={() => onChange('increase')}
                        style={{ flex: 1 }}
                      />
                      <Tile
                        label="Decrease balance"
                        icon="arrow-down-bold"
                        color="#EF4444"
                        selected={value === 'decrease'}
                        onPress={() => onChange('decrease')}
                        style={{ flex: 1 }}
                      />
                    </View>
                  )}
                />
              </View>
            )}

            {type !== 'transfer' ? (
              <>
                {classifiable && (
                  <View>
                    <SectionLabel
                      action={
                        <Chip compact textStyle={{ fontSize: 11 }}>
                          {ALLOCATION_LABEL[livePreview].label}
                        </Chip>
                      }
                    >
                      Classify
                    </SectionLabel>
                    <Controller
                      control={control}
                      name="category"
                      render={({ field: { onChange, value } }) => (
                        <PickerField
                          label="Category"
                          value={value}
                          onSelect={onChange}
                          options={[
                            { value: '', label: 'Leave unallocated' },
                            ...filteredCategories.map((c) => ({ value: c._id, label: c.name })),
                          ]}
                        />
                      )}
                    />
                    {category && (
                      <Controller
                        control={control}
                        name="subcategory"
                        render={({ field: { onChange, value } }) => (
                          <PickerField
                            label={subcategories.length ? 'Subcategory' : 'No subcategories'}
                            value={value}
                            onSelect={onChange}
                            disabled={subcategories.length === 0}
                            options={[
                              { value: '', label: 'Leave unallocated' },
                              ...subcategories.map((s) => ({ value: s._id, label: s.name })),
                            ]}
                          />
                        )}
                      />
                    )}
                  </View>
                )}

                <View>
                  <SectionLabel>Paid With</SectionLabel>
                  <Controller
                    control={control}
                    name="paymentMethod"
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.tileRow}>
                        {Object.entries(PAYMENT_META).map(([val, meta]) => (
                          <Tile
                            key={val}
                            label={meta.label}
                            icon={meta.icon}
                            color={brand.teal}
                            selected={value === val}
                            onPress={() => onChange(val)}
                          />
                        ))}
                      </View>
                    )}
                  />
                  {paymentMethod === 'bank' && (
                    <Controller
                      control={control}
                      name="bankAccount"
                      render={({ field: { onChange, value } }) => (
                        <PickerField
                          label="Bank Account"
                          value={value}
                          onSelect={onChange}
                          options={[
                            { value: '', label: 'Select account' },
                            ...bankAccounts.map((b) => ({
                              value: b._id,
                              label: `${b.bankName}${b.accountNickname ? ` — ${b.accountNickname}` : ''}`,
                            })),
                          ]}
                        />
                      )}
                    />
                  )}
                  {paymentMethod === 'upi' && (
                    <Controller
                      control={control}
                      name="upiAccount"
                      render={({ field: { onChange, value } }) => (
                        <PickerField
                          label="UPI Account"
                          value={value}
                          onSelect={onChange}
                          options={[
                            { value: '', label: 'Select account' },
                            ...upiAccounts.map((u) => ({ value: u._id, label: u.nickname || u.provider })),
                          ]}
                        />
                      )}
                    />
                  )}
                </View>
              </>
            ) : (
              <View>
                <SectionLabel>Route</SectionLabel>
                <Text variant="labelSmall" style={{ color: '#94A3B8', marginBottom: 6 }}>
                  From
                </Text>
                <Controller
                  control={control}
                  name="fromType"
                  render={({ field: { onChange, value } }) => (
                    <PickerField
                      label="From"
                      value={value}
                      onSelect={onChange}
                      options={[
                        { value: 'bank', label: 'Bank Account' },
                        { value: 'cash', label: 'Cash' },
                      ]}
                    />
                  )}
                />
                {fromType === 'bank' && (
                  <Controller
                    control={control}
                    name="fromBankAccount"
                    rules={{ required: 'Required' }}
                    render={({ field: { onChange, value } }) => (
                      <PickerField
                        label="From Bank"
                        value={value}
                        onSelect={onChange}
                        options={bankAccounts.map((b) => ({ value: b._id, label: b.bankName }))}
                      />
                    )}
                  />
                )}

                <View style={{ alignItems: 'center', marginVertical: 4 }}>
                  <MaterialCommunityIcons name="arrow-down-bold" size={20} color={brand.info || '#3B82F6'} />
                </View>

                <Text variant="labelSmall" style={{ color: '#94A3B8', marginBottom: 6 }}>
                  To
                </Text>
                <Controller
                  control={control}
                  name="toType"
                  render={({ field: { onChange, value } }) => (
                    <PickerField
                      label="To"
                      value={value}
                      onSelect={onChange}
                      options={[
                        { value: 'bank', label: 'Bank Account' },
                        { value: 'cash', label: 'Cash' },
                      ]}
                    />
                  )}
                />
                {toType === 'bank' && (
                  <Controller
                    control={control}
                    name="toBankAccount"
                    rules={{ required: 'Required' }}
                    render={({ field: { onChange, value } }) => (
                      <PickerField
                        label="To Bank"
                        value={value}
                        onSelect={onChange}
                        options={bankAccounts.map((b) => ({ value: b._id, label: b.bankName }))}
                      />
                    )}
                  />
                )}
              </View>
            )}

            <Divider style={{ marginVertical: 4 }} />

            <Controller
              control={control}
              name="note"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Note (optional)"
                  placeholder="What was this for?"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  multiline
                  numberOfLines={2}
                  style={styles.input}
                />
              )}
            />
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.footer}>
          <Button onPress={onClose} disabled={submitting} style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit(submitHandler)}
            loading={submitting}
            disabled={submitting}
            style={{ flex: 1 }}
          >
            {isEdit ? 'Save' : 'Add'}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: { backgroundColor: '#FFFFFF', flex: 1, marginTop: 40, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  accentBar: { height: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, paddingBottom: 8 },
  body: { paddingHorizontal: 16, paddingBottom: 16, gap: 18 },
  row: { flexDirection: 'row', gap: 12 },
  rowGap: { flexDirection: 'row', gap: 10 },
  input: { backgroundColor: '#FFFFFF', marginBottom: 4 },
  tileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { width: 78, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  sectionLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionLabel: { color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 11 },
  footer: { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
});

export default TransactionFormDialog;
