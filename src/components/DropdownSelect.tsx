import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    TextInput,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../theme/colors';

export type DropdownOption = {
    label: string;
    value: string;
};

type DropdownSelectProps = {
    label: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    disabledHint?: string; // shown when disabled + tapped, e.g. "Select a state first"
    multiple?: boolean;
    value: string | string[];
    onChange: (value: any) => void;
    /** Static option list — used when onSearch isn't provided. */
    options?: DropdownOption[];
    /** Async search — called with the query string whenever it changes (debounced). */
    onSearch?: (query: string) => Promise<DropdownOption[]>;
    searchable?: boolean;
    debounceMs?: number;
    emptyText?: string;
    errorText?: string;
};

export const DropdownSelect: React.FC<DropdownSelectProps> = ({
    label,
    placeholder = 'Select',
    required,
    disabled,
    disabledHint,
    multiple = false,
    value,
    onChange,
    options,
    onSearch,
    searchable,
    debounceMs = 350,
    emptyText = 'No results found.',
    errorText,
}) => {
    const [visible, setVisible] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<DropdownOption[]>(options ?? []);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [pendingMulti, setPendingMulti] = useState<string[]>(
        multiple ? (value as string[]) ?? [] : [],
    );
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isSearchable = searchable ?? !!onSearch;

    const selectedValues: string[] = multiple
        ? (value as string[]) ?? []
        : value
        ? [value as string]
        : [];

    const runSearch = useCallback(
        async (q: string) => {
            if (!onSearch) return;
            setLoading(true);
            setFetchError(null);
            try {
                const data = await onSearch(q);
                setResults(data);
            } catch (e) {
                setFetchError('Something went wrong. Try again.');
            } finally {
                setLoading(false);
            }
        },
        [onSearch],
    );

    // Fetch on open + whenever query changes (debounced)
    useEffect(() => {
        if (!visible) return;
        if (!onSearch) {
            const source = options ?? [];
            setResults(
                query
                    ? source.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
                    : source,
            );
            return;
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => runSearch(query), query ? debounceMs : 0);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, query]);

    useEffect(() => {
        if (!visible) return;
        setResults(options ?? []);
    }, [visible, options]);

    const openModal = () => {
        if (disabled) return;
        setQuery('');
        setPendingMulti(multiple ? [...selectedValues] : []);
        setVisible(true);
    };

    const closeModal = () => setVisible(false);

    const handleSelect = (opt: DropdownOption) => {
        if (multiple) {
            setPendingMulti(prev =>
                prev.includes(opt.value) ? prev.filter(v => v !== opt.value) : [...prev, opt.value],
            );
        } else {
            onChange(opt.value);
            closeModal();
        }
    };

    const applyMulti = () => {
        onChange(pendingMulti);
        closeModal();
    };

    const selectedLabel = (): string => {
        if (multiple) {
            if (selectedValues.length === 0) return '';
            if (selectedValues.length === 1) {
                return options?.find(o => o.value === selectedValues[0])?.label ?? '1 selected';
            }
            return `${selectedValues.length} selected`;
        }
        const found = (options ?? results).find(o => o.value === value);
        return found?.label ?? (typeof value === 'string' ? value : '');
    };

    const activeSet = multiple ? pendingMulti : selectedValues;

    return (
        <View style={styles.wrap}>
            <Text style={styles.label}>
                {label}
                {required && <Text style={styles.required}> *</Text>}
            </Text>

            <TouchableOpacity
                style={[styles.trigger, disabled && styles.triggerDisabled]}
                activeOpacity={disabled ? 1 : 0.7}
                onPress={openModal}
            >
                <Text
                    style={[
                        styles.triggerText,
                        !selectedLabel() && styles.triggerPlaceholder,
                        disabled && styles.triggerTextDisabled,
                    ]}
                    numberOfLines={1}
                >
                    {selectedLabel() || (disabled && disabledHint ? disabledHint : placeholder)}
                </Text>
                <Icon
                    name="keyboard-arrow-down"
                    size={22}
                    color={disabled ? '#C3D3D9' : Colors.textMuted}
                />
            </TouchableOpacity>
            {!!errorText && <Text style={styles.errorText}>{errorText}</Text>}

            <Modal visible={visible} transparent animationType="slide" onRequestClose={closeModal}>
                <Pressable style={styles.backdrop} onPress={closeModal} />
                <View style={styles.sheet}>
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>{label}</Text>
                        <TouchableOpacity
                            onPress={closeModal}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Icon name="close" size={22} color={Colors.textMedium} />
                        </TouchableOpacity>
                    </View>

                    {isSearchable && (
                        <View style={styles.searchBox}>
                            <Icon name="search" size={18} color="#A8BEC8" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder={`Search ${label.toLowerCase()}...`}
                                placeholderTextColor="#A8BEC8"
                                value={query}
                                onChangeText={setQuery}
                                autoCorrect={false}
                                autoCapitalize="none"
                                autoFocus
                            />
                            {query.length > 0 && (
                                <TouchableOpacity onPress={() => setQuery('')}>
                                    <Icon name="cancel" size={16} color="#A8BEC8" />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {loading && (
                        <View style={styles.stateBox}>
                            <ActivityIndicator size="small" color={Colors.gradientStart} />
                            <Text style={styles.stateText}>Searching...</Text>
                        </View>
                    )}

                    {!loading && fetchError && (
                        <View style={styles.stateBox}>
                            <Icon name="error-outline" size={18} color="#E53935" />
                            <Text style={[styles.stateText, { color: '#E53935' }]}>
                                {fetchError}
                            </Text>
                        </View>
                    )}

                    {!loading && !fetchError && results.length === 0 && (
                        <View style={styles.stateBox}>
                            <Icon name="inbox" size={20} color={Colors.textMedium} />
                            <Text style={styles.stateText}>{emptyText}</Text>
                        </View>
                    )}

                    {!loading && !fetchError && results.length > 0 && (
                        <FlatList
                            data={results}
                            keyExtractor={item => item.value}
                            keyboardShouldPersistTaps="handled"
                            style={styles.list}
                            renderItem={({ item }) => {
                                const active = activeSet.includes(item.value);
                                return (
                                    <TouchableOpacity
                                        style={styles.optionRow}
                                        activeOpacity={0.7}
                                        onPress={() => handleSelect(item)}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                active && styles.optionTextActive,
                                            ]}
                                        >
                                            {item.label}
                                        </Text>
                                        <Icon
                                            name={
                                                multiple
                                                    ? active
                                                        ? 'check-box'
                                                        : 'check-box-outline-blank'
                                                    : active
                                                    ? 'radio-button-checked'
                                                    : 'radio-button-unchecked'
                                            }
                                            size={20}
                                            color={active ? Colors.gradientStart : '#C3D3D9'}
                                        />
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    )}

                    {multiple && (
                        <TouchableOpacity
                            style={styles.applyBtn}
                            onPress={applyMulti}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.applyText}>
                                Apply{pendingMulti.length ? ` (${pendingMulti.length})` : ''}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    wrap: { marginBottom: 16 },
    label: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textMuted,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    required: { color: Colors.gradientStart },
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1.5,
        borderColor: '#D8E8EE',
        borderRadius: 14,
        backgroundColor: '#F8FBFC',
        height: 52,
        paddingHorizontal: 16,
    },
    triggerDisabled: { backgroundColor: '#F2F5F6', borderColor: '#E8EEF0' },
    triggerText: { fontSize: 15, color: Colors.textDark, fontWeight: '500', flex: 1 },
    triggerPlaceholder: { color: '#A8BEC8', fontWeight: '400' },
    triggerTextDisabled: { color: '#B7C6CC' },
    errorText: { fontSize: 11, color: '#E53935', fontWeight: '500', marginTop: 6 },

    backdrop: { flex: 1, backgroundColor: 'rgba(11,46,58,0.4)' },
    sheet: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
        maxHeight: '75%',
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    sheetTitle: { fontSize: 16, fontWeight: '800', color: Colors.textDark },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F8FBFC',
        borderWidth: 1.5,
        borderColor: '#E8F0F4',
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 46,
        marginBottom: 10,
    },
    searchInput: { flex: 1, fontSize: 14, color: Colors.textDark },
    list: { marginBottom: 4 },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 13,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F5F7',
    },
    optionText: { fontSize: 14.5, color: Colors.textDark, flex: 1, marginRight: 10 },
    optionTextActive: { color: Colors.gradientStart, fontWeight: '700' },
    stateBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        justifyContent: 'center',
        paddingVertical: 24,
    },
    stateText: { fontSize: 13, color: Colors.textMedium },
    applyBtn: {
        backgroundColor: Colors.gradientStart,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 10,
    },
    applyText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
});
