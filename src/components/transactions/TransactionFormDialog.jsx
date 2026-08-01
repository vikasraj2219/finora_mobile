import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
} from 'react-native';
import { Portal, Modal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { listSubcategories } from '../../api/subcategoryApi';
import { listMerchants } from '../../api/merchantApi';
import FinoraButton from '../ui/FinoraButton';
import FinoraChip from '../ui/FinoraChip';
import FinoraBottomSheet from '../ui/FinoraBottomSheet';
import tokens from '../../theme/tokens';

const TYPE_META = {
  expense: { label: 'Expense', tone: 'expense' },
  income: { label: 'Income', tone: 'income' },
  transfer: { label: 'Transfer', tone: 'transfer' },
};

const MORE_TYPE_META = {
  adjustment: { label: 'Adjustment', icon: 'tune', tone: 'warning' },
  opening_balance: { label: 'Opening Balance', icon: 'wallet-outline', tone: 'brand' },
};

const PAYMENT_META = {
  cash: { label: 'Cash', icon: 'cash' },
  bank: { label: 'Bank', icon: 'bank-outline' },
  upi: { label: 'UPI', icon: 'qrcode' },
  card: { label: 'Card', icon: 'credit-card-outline' },
  other: { label: 'Other', icon: 'dots-horizontal' },
};

const ALLOCATION_LABEL = {
  UNALLOCATED: '🔴 Unallocated',
  PARTIALLY_ALLOCATED: '🟡 Partial',
  FULLY_ALLOCATED: '🟢 Complete',
};

const emptyDefaults = {
  type: 'expense',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  paymentMethod: 'bank',
  category: '',
  subcategory: '',
  merchant: '',
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
    merchant: txn.merchant?._id || txn.merchant || '',
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

const fmtDateLabel = (isoDate) => {
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
};

// Field row that opens a bottom-sheet picker — the composer's core interaction
// per brief §9 ("use bottom sheet selectors where appropriate").
const PickerRow = ({ label, valueLabel, placeholder = 'Select', icon, onPress }) => (
  <Pressable onPress={onPress} style={styles.pickerRow}>
    <View style={{ flex: 1 }}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <Text style={[styles.pickerValue, !valueLabel && styles.pickerPlaceholder]}>{valueLabel || placeholder}</Text>
    </View>
    <MaterialCommunityIcons name={icon || 'chevron-right'} size={20} color={tokens.neutral.textMuted} />
  </Pressable>
);

// Premium transaction composer — mirrors frontend/src/components/transactions/
// TransactionFormDialog.jsx's data contract exactly (same payload shape sent to
// the API) but redesigned per brief §9: amount-first, segmented type control,
// progressive disclosure (only relevant fields shown per type), bottom-sheet
// pickers instead of dropdown menus, native date picker, Save & Add Another.
const TransactionFormDialog = ({ open, onClose, onSubmit, initialValues, presetType, categories, bankAccounts, upiAccounts }) => {
  const isEdit = Boolean(initialValues);
  const [showMoreTypes, setShowMoreTypes] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeSheet, setActiveSheet] = useState(null); // 'category' | 'subcategory' | 'merchant' | 'paymentAccount' | 'fromAccount' | 'toAccount'
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: emptyDefaults });

  const type = watch('type');
  const amount = watch('amount');
  const paymentMethod = watch('paymentMethod');
  const category = watch('category');
  const subcategory = watch('subcategory');
  const merchant = watch('merchant');
  const date = watch('date');
  const fromType = watch('fromType');
  const toType = watch('toType');
  const fromBankAccount = watch('fromBankAccount');
  const toBankAccount = watch('toBankAccount');
  const bankAccount = watch('bankAccount');
  const upiAccount = watch('upiAccount');

  useEffect(() => {
    if (open) {
      reset(toFormValues(initialValues, presetType));
      setShowMoreTypes(initialValues && MORE_TYPE_META[initialValues.type] ? true : false);
      listMerchants().then(({ data }) => setMerchants(data.data)).catch(() => setMerchants([]));
    }
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
    if (!isEdit || category !== initialValues?.category?._id) setValue('subcategory', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const classifiable = type === 'income' || type === 'expense';
  const filteredCategories = useMemo(() => categories.filter((c) => c.type === type), [categories, type]);
  const selectedCategory = filteredCategories.find((c) => c._id === category);
  const selectedSubcategory = subcategories.find((s) => s._id === subcategory);
  const selectedMerchant = merchants.find((m) => m._id === merchant);
  const selectedBankAccountForPayment = bankAccounts.find((b) => b._id === bankAccount);
  const selectedUpiAccount = upiAccounts.find((u) => u._id === upiAccount);
  const selectedFromBank = bankAccounts.find((b) => b._id === fromBankAccount);
  const selectedToBank = bankAccounts.find((b) => b._id === toBankAccount);

  const setCount = classifiable ? 1 + (category ? 1 : 0) + (subcategory ? 1 : 0) : 3;
  const livePreview = !classifiable ? 'FULLY_ALLOCATED' : setCount === 3 ? 'FULLY_ALLOCATED' : setCount === 0 ? 'UNALLOCATED' : 'PARTIALLY_ALLOCATED';

  const buildPayload = (values) => {
    const payload = { type: values.type, amount: Number(values.amount), date: values.date, note: values.note || undefined };

    if (values.type === 'transfer') {
      payload.transferFrom = { type: values.fromType, bankAccount: values.fromType === 'bank' ? values.fromBankAccount : undefined };
      payload.transferTo = { type: values.toType, bankAccount: values.toType === 'bank' ? values.toBankAccount : undefined };
    } else {
      payload.paymentMethod = values.paymentMethod;
      if (values.paymentMethod === 'bank' && values.bankAccount) payload.bankAccount = values.bankAccount;
      if (values.paymentMethod === 'upi' && values.upiAccount) payload.upiAccount = values.upiAccount;
      if (values.type === 'adjustment') payload.direction = values.direction;
      if (classifiable) {
        if (values.category) payload.category = values.category;
        if (values.subcategory) payload.subcategory = values.subcategory;
        if (values.merchant) payload.merchant = values.merchant;
      }
    }
    return payload;
  };

  const submitHandler = async (values) => {
    setSubmitting(true);
    try {
      await onSubmit(buildPayload(values));
    } finally {
      setSubmitting(false);
    }
  };

  const submitAndAddAnother = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await onSubmit(buildPayload(values));
      reset({ ...emptyDefaults, type: values.type, paymentMethod: values.paymentMethod });
    } finally {
      setSubmitting(false);
    }
  });

  const accent = TYPE_META[type] ? tokens.semantic[TYPE_META[type].tone] : tokens.semantic[MORE_TYPE_META[type]?.tone] || tokens.brand.ink800;

  return (
    <Portal>
      <Modal visible={open} onDismiss={onClose} contentContainerStyle={styles.modal}>
        <View style={[styles.accentBar, { backgroundColor: accent }]} />
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>
              {isEdit ? 'Edit Transaction' : TYPE_META[type] ? `New ${TYPE_META[type].label}` : MORE_TYPE_META[type]?.label}
            </Text>
            {isEdit && initialValues?.allocationStatus && (
              <Text style={styles.headerBadge}>{ALLOCATION_LABEL[initialValues.allocationStatus]}</Text>
            )}
          </View>
          <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
            <MaterialCommunityIcons name="close" size={20} color={tokens.neutral.textSecondary} />
          </Pressable>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            {/* Amount — the most important field, per brief §9 */}
            <Controller
              control={control}
              name="amount"
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.amountWrap}>
                  <Text style={[styles.amountPrefix, { color: accent }]}>₹</Text>
                  <RNTextInput
                    value={value}
                    onChangeText={onChange}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={tokens.neutral.textMuted}
                    style={[styles.amountInput, { color: accent }]}
                    autoFocus={!isEdit}
                  />
                </View>
              )}
            />
            {!amount && errors.amount && <Text style={styles.errorText}>Enter an amount</Text>}

            {/* Type segmented control */}
            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <View style={styles.segmentRow}>
                  {Object.entries(TYPE_META).map(([val, meta]) => {
                    const selected = value === val;
                    const color = tokens.semantic[meta.tone];
                    return (
                      <Pressable
                        key={val}
                        onPress={() => onChange(val)}
                        style={[styles.segment, selected && { backgroundColor: color }]}
                      >
                        <Text style={[styles.segmentLabel, { color: selected ? '#fff' : tokens.neutral.textSecondary }]}>
                          {meta.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            />

            <Pressable onPress={() => setShowMoreTypes((v) => !v)} style={styles.moreTypesToggle}>
              <Text style={styles.moreTypesText}>
                {MORE_TYPE_META[type] ? MORE_TYPE_META[type].label : 'More types (Adjustment, Opening Balance)'}
              </Text>
              <MaterialCommunityIcons name={showMoreTypes ? 'chevron-up' : 'chevron-down'} size={16} color={tokens.neutral.textMuted} />
            </Pressable>

            {showMoreTypes && (
              <Controller
                control={control}
                name="type"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.moreTypesRow}>
                    {Object.entries(MORE_TYPE_META).map(([val, meta]) => {
                      const selected = value === val;
                      const color = tokens.semantic[meta.tone] || tokens.brand.ink800;
                      return (
                        <Pressable
                          key={val}
                          onPress={() => onChange(val)}
                          style={[styles.moreTypeTile, { borderColor: selected ? color : tokens.neutral.border }]}
                        >
                          <MaterialCommunityIcons name={meta.icon} size={16} color={selected ? color : tokens.neutral.textMuted} />
                          <Text style={[styles.moreTypeLabel, { color: selected ? color : tokens.neutral.textSecondary }]}>
                            {meta.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              />
            )}

            {type === 'adjustment' && (
              <Controller
                control={control}
                name="direction"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.rowGap}>
                    <Pressable
                      onPress={() => onChange('increase')}
                      style={[styles.dirTile, value === 'increase' && { borderColor: tokens.semantic.income, backgroundColor: tokens.semantic.incomeTint }]}
                    >
                      <MaterialCommunityIcons name="arrow-up-bold" size={16} color={tokens.semantic.income} />
                      <Text style={styles.dirLabel}>Increase balance</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => onChange('decrease')}
                      style={[styles.dirTile, value === 'decrease' && { borderColor: tokens.semantic.expense, backgroundColor: tokens.semantic.expenseTint }]}
                    >
                      <MaterialCommunityIcons name="arrow-down-bold" size={16} color={tokens.semantic.expense} />
                      <Text style={styles.dirLabel}>Decrease balance</Text>
                    </Pressable>
                  </View>
                )}
              />
            )}

            {/* Progressive disclosure: category/merchant/payment for expense+income, route for transfer */}
            {type !== 'transfer' ? (
              <>
                {classifiable && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                      <Text style={styles.sectionLabel}>Classify</Text>
                      <FinoraChip label={ALLOCATION_LABEL[livePreview]} tone="neutral" />
                    </View>
                    <PickerRow label="Category" valueLabel={selectedCategory?.name} onPress={() => setActiveSheet('category')} />
                    {category && (
                      <PickerRow
                        label="Subcategory"
                        valueLabel={selectedSubcategory?.name}
                        placeholder={subcategories.length ? 'Select' : 'No subcategories'}
                        onPress={() => subcategories.length && setActiveSheet('subcategory')}
                      />
                    )}
                    <PickerRow
                      label={type === 'income' ? 'Received From' : 'Paid To'}
                      valueLabel={selectedMerchant?.name}
                      placeholder="Not set"
                      onPress={() => setActiveSheet('merchant')}
                    />
                  </View>
                )}

                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>{type === 'income' ? 'Received Into' : 'Paid With'}</Text>
                  <Controller
                    control={control}
                    name="paymentMethod"
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.tileRow}>
                        {Object.entries(PAYMENT_META).map(([val, meta]) => {
                          const selected = value === val;
                          return (
                            <Pressable
                              key={val}
                              onPress={() => onChange(val)}
                              style={[styles.paymentTile, selected && { borderColor: tokens.brand.teal500, backgroundColor: tokens.brand.teal100 }]}
                            >
                              <MaterialCommunityIcons name={meta.icon} size={17} color={selected ? tokens.brand.teal600 : tokens.neutral.textMuted} />
                              <Text style={[styles.paymentLabel, selected && { color: tokens.brand.teal600, fontWeight: '700' }]}>
                                {meta.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    )}
                  />
                  {paymentMethod === 'bank' && (
                    <PickerRow
                      label="Bank Account"
                      valueLabel={selectedBankAccountForPayment ? `${selectedBankAccountForPayment.bankName}${selectedBankAccountForPayment.accountNickname ? ` — ${selectedBankAccountForPayment.accountNickname}` : ''}` : ''}
                      onPress={() => setActiveSheet('paymentAccount')}
                    />
                  )}
                  {paymentMethod === 'upi' && (
                    <PickerRow
                      label="UPI Account"
                      valueLabel={selectedUpiAccount?.nickname || selectedUpiAccount?.provider}
                      onPress={() => setActiveSheet('paymentAccount')}
                    />
                  )}
                </View>
              </>
            ) : (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Route</Text>
                <PickerRow
                  label="From"
                  valueLabel={fromType === 'cash' ? 'Cash' : selectedFromBank?.bankName}
                  onPress={() => setActiveSheet('fromAccount')}
                />
                <View style={styles.arrowDivider}>
                  <MaterialCommunityIcons name="arrow-down-bold-circle" size={22} color={tokens.semantic.transfer} />
                </View>
                <PickerRow
                  label="To"
                  valueLabel={toType === 'cash' ? 'Cash' : selectedToBank?.bankName}
                  onPress={() => setActiveSheet('toAccount')}
                />
              </View>
            )}

            {/* Date */}
            <View style={styles.section}>
              <PickerRow label="Date" valueLabel={fmtDateLabel(date)} icon="calendar-month-outline" onPress={() => setShowDatePicker(true)} />
            </View>

            {/* Notes */}
            <Controller
              control={control}
              name="note"
              render={({ field: { onChange, value } }) => (
                <RNTextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Add a note (optional)"
                  placeholderTextColor={tokens.neutral.textMuted}
                  multiline
                  style={styles.noteInput}
                />
              )}
            />
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.footer}>
          <FinoraButton label="Cancel" variant="ghost" onPress={onClose} disabled={submitting} style={{ flex: 1 }} />
          {!isEdit && (
            <FinoraButton
              label="Save & Add Another"
              variant="secondary"
              onPress={submitAndAddAnother}
              disabled={submitting}
              style={{ flex: 1.3 }}
            />
          )}
          <FinoraButton
            label={isEdit ? 'Save' : 'Save'}
            variant="primary"
            onPress={handleSubmit(submitHandler)}
            loading={submitting}
            disabled={submitting}
            style={{ flex: 1 }}
          />
        </View>

        {showDatePicker && Platform.OS === 'ios' && (
          <View style={styles.iosDatePickerWrap}>
            <View style={styles.iosDatePickerHeader}>
              <Pressable onPress={() => setShowDatePicker(false)}>
                <Text style={styles.iosDatePickerDone}>Done</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={new Date(date)}
              mode="date"
              display="inline"
              onChange={(event, selectedDate) => {
                if (selectedDate) setValue('date', selectedDate.toISOString().slice(0, 10));
              }}
            />
          </View>
        )}
        {showDatePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={new Date(date)}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setValue('date', selectedDate.toISOString().slice(0, 10));
            }}
          />
        )}

        {/* Category picker */}
        <FinoraBottomSheet visible={activeSheet === 'category'} onClose={() => setActiveSheet(null)} title={<Text style={styles.sheetTitle}>Category</Text>}>
          <ScrollView style={{ maxHeight: 380 }}>
            <Pressable style={styles.sheetOption} onPress={() => { setValue('category', ''); setActiveSheet(null); }}>
              <Text style={styles.sheetOptionText}>Leave unallocated</Text>
            </Pressable>
            {filteredCategories.map((c) => (
              <Pressable key={c._id} style={styles.sheetOption} onPress={() => { setValue('category', c._id); setActiveSheet(null); }}>
                <View style={[styles.sheetDot, { backgroundColor: c.color }]} />
                <Text style={styles.sheetOptionText}>{c.name}</Text>
                {category === c._id && <MaterialCommunityIcons name="check" size={18} color={tokens.brand.teal600} />}
              </Pressable>
            ))}
          </ScrollView>
        </FinoraBottomSheet>

        {/* Subcategory picker */}
        <FinoraBottomSheet visible={activeSheet === 'subcategory'} onClose={() => setActiveSheet(null)} title={<Text style={styles.sheetTitle}>Subcategory</Text>}>
          <ScrollView style={{ maxHeight: 380 }}>
            <Pressable style={styles.sheetOption} onPress={() => { setValue('subcategory', ''); setActiveSheet(null); }}>
              <Text style={styles.sheetOptionText}>Leave unallocated</Text>
            </Pressable>
            {subcategories.map((s) => (
              <Pressable key={s._id} style={styles.sheetOption} onPress={() => { setValue('subcategory', s._id); setActiveSheet(null); }}>
                <Text style={styles.sheetOptionText}>{s.name}</Text>
                {subcategory === s._id && <MaterialCommunityIcons name="check" size={18} color={tokens.brand.teal600} />}
              </Pressable>
            ))}
          </ScrollView>
        </FinoraBottomSheet>

        {/* Merchant picker */}
        <FinoraBottomSheet
          visible={activeSheet === 'merchant'}
          onClose={() => setActiveSheet(null)}
          title={<Text style={styles.sheetTitle}>{type === 'income' ? 'Received From' : 'Paid To'}</Text>}
        >
          <ScrollView style={{ maxHeight: 380 }}>
            <Pressable style={styles.sheetOption} onPress={() => { setValue('merchant', ''); setActiveSheet(null); }}>
              <Text style={styles.sheetOptionText}>Not set</Text>
            </Pressable>
            {merchants.map((m) => (
              <Pressable key={m._id} style={styles.sheetOption} onPress={() => { setValue('merchant', m._id); setActiveSheet(null); }}>
                <Text style={styles.sheetOptionText}>{m.name}</Text>
                {merchant === m._id && <MaterialCommunityIcons name="check" size={18} color={tokens.brand.teal600} />}
              </Pressable>
            ))}
          </ScrollView>
        </FinoraBottomSheet>

        {/* Payment account picker (bank or upi, depending on paymentMethod) */}
        <FinoraBottomSheet
          visible={activeSheet === 'paymentAccount'}
          onClose={() => setActiveSheet(null)}
          title={<Text style={styles.sheetTitle}>{paymentMethod === 'upi' ? 'UPI Account' : 'Bank Account'}</Text>}
        >
          <ScrollView style={{ maxHeight: 380 }}>
            {(paymentMethod === 'upi' ? upiAccounts : bankAccounts).map((a) => (
              <Pressable
                key={a._id}
                style={styles.sheetOption}
                onPress={() => {
                  setValue(paymentMethod === 'upi' ? 'upiAccount' : 'bankAccount', a._id);
                  setActiveSheet(null);
                }}
              >
                <Text style={styles.sheetOptionText}>{paymentMethod === 'upi' ? a.nickname || a.provider : `${a.bankName}${a.accountNickname ? ` — ${a.accountNickname}` : ''}`}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </FinoraBottomSheet>

        {/* Transfer From picker */}
        <FinoraBottomSheet visible={activeSheet === 'fromAccount'} onClose={() => setActiveSheet(null)} title={<Text style={styles.sheetTitle}>Transfer From</Text>}>
          <ScrollView style={{ maxHeight: 380 }}>
            <Pressable style={styles.sheetOption} onPress={() => { setValue('fromType', 'cash'); setActiveSheet(null); }}>
              <Text style={styles.sheetOptionText}>Cash</Text>
            </Pressable>
            {bankAccounts.map((b) => (
              <Pressable
                key={b._id}
                style={styles.sheetOption}
                onPress={() => { setValue('fromType', 'bank'); setValue('fromBankAccount', b._id); setActiveSheet(null); }}
              >
                <Text style={styles.sheetOptionText}>{b.bankName}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </FinoraBottomSheet>

        {/* Transfer To picker */}
        <FinoraBottomSheet visible={activeSheet === 'toAccount'} onClose={() => setActiveSheet(null)} title={<Text style={styles.sheetTitle}>Transfer To</Text>}>
          <ScrollView style={{ maxHeight: 380 }}>
            <Pressable style={styles.sheetOption} onPress={() => { setValue('toType', 'cash'); setActiveSheet(null); }}>
              <Text style={styles.sheetOptionText}>Cash</Text>
            </Pressable>
            {bankAccounts.map((b) => (
              <Pressable
                key={b._id}
                style={styles.sheetOption}
                onPress={() => { setValue('toType', 'bank'); setValue('toBankAccount', b._id); setActiveSheet(null); }}
              >
                <Text style={styles.sheetOptionText}>{b.bankName}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </FinoraBottomSheet>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: { backgroundColor: tokens.neutral.surface, flex: 1, marginTop: 40, borderTopLeftRadius: tokens.radius.xl, borderTopRightRadius: tokens.radius.xl, overflow: 'hidden' },
  accentBar: { height: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: tokens.space.lg, paddingBottom: tokens.space.sm },
  headerTitle: { ...tokens.typography.h3, color: tokens.neutral.textPrimary },
  headerBadge: { ...tokens.typography.caption, color: tokens.neutral.textMuted, marginTop: 2 },
  closeBtn: { padding: 4 },
  body: { paddingHorizontal: tokens.space.lg, paddingBottom: tokens.space.lg, gap: tokens.space.lg },

  amountWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: tokens.space.md },
  amountPrefix: { fontSize: 30, fontWeight: '700', marginRight: 4 },
  amountInput: { fontSize: 44, fontWeight: '700', minWidth: 120, textAlign: 'center', padding: 0 },
  errorText: { color: tokens.semantic.error, textAlign: 'center', fontSize: 12, marginTop: -12 },

  segmentRow: { flexDirection: 'row', backgroundColor: tokens.neutral.surfaceAlt, borderRadius: tokens.radius.md, padding: 4, gap: 4 },
  segment: { flex: 1, paddingVertical: 10, borderRadius: tokens.radius.sm, alignItems: 'center' },
  segmentLabel: { ...tokens.typography.bodySm, fontWeight: '700' },

  moreTypesToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: -8 },
  moreTypesText: { ...tokens.typography.caption, color: tokens.neutral.textMuted },
  moreTypesRow: { flexDirection: 'row', gap: 8 },
  moreTypeTile: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderRadius: tokens.radius.md, paddingVertical: 10 },
  moreTypeLabel: { ...tokens.typography.bodySm, fontWeight: '600' },

  rowGap: { flexDirection: 'row', gap: 10 },
  dirTile: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: tokens.neutral.border, borderRadius: tokens.radius.md, paddingVertical: 12 },
  dirLabel: { ...tokens.typography.bodySm, fontWeight: '600', color: tokens.neutral.textPrimary },

  section: { gap: 2 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sectionLabel: { ...tokens.typography.label, color: tokens.neutral.textMuted, marginBottom: 6 },

  pickerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: tokens.neutral.border },
  pickerLabel: { ...tokens.typography.caption, color: tokens.neutral.textMuted },
  pickerValue: { ...tokens.typography.bodyLg, color: tokens.neutral.textPrimary, fontWeight: '600', marginTop: 2 },
  pickerPlaceholder: { color: tokens.neutral.textMuted, fontWeight: '400' },

  tileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4, marginBottom: 4 },
  paymentTile: { width: 70, paddingVertical: 10, borderRadius: tokens.radius.md, borderWidth: 1.5, borderColor: tokens.neutral.border, alignItems: 'center', gap: 4 },
  paymentLabel: { fontSize: 11, color: tokens.neutral.textSecondary },

  arrowDivider: { alignItems: 'center', paddingVertical: 2 },

  noteInput: {
    ...tokens.typography.body,
    color: tokens.neutral.textPrimary,
    backgroundColor: tokens.neutral.surfaceAlt,
    borderRadius: tokens.radius.md,
    padding: tokens.space.md,
    minHeight: 60,
    textAlignVertical: 'top',
  },

  footer: { flexDirection: 'row', gap: 10, padding: tokens.space.lg, borderTopWidth: 1, borderTopColor: tokens.neutral.border },

  iosDatePickerWrap: { borderTopWidth: 1, borderTopColor: tokens.neutral.border, backgroundColor: tokens.neutral.surface },
  iosDatePickerHeader: { flexDirection: 'row', justifyContent: 'flex-end', padding: tokens.space.md },
  iosDatePickerDone: { ...tokens.typography.body, color: tokens.brand.teal600, fontWeight: '700' },

  sheetTitle: { ...tokens.typography.h3, color: tokens.neutral.textPrimary },
  sheetOption: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: tokens.neutral.border },
  sheetOptionText: { ...tokens.typography.bodyLg, color: tokens.neutral.textPrimary, flex: 1 },
  sheetDot: { width: 10, height: 10, borderRadius: 5 },
});

export default TransactionFormDialog;
