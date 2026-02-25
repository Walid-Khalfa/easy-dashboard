import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { AutoComplete, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { request } from '@/request';
import { useCrudContext } from '@/context/crud';
import { selectSearchedItems } from '@/redux/crud/selectors';
import { Empty } from 'antd';

function SearchItemComponent({ config }) {
  let { entity, searchConfig } = config;

  const { displayLabels, searchFields, outputValue = '_id' } = searchConfig;
  const dispatch = useDispatch();
  const [value, setValue] = useState('');
  const [options, setOptions] = useState([]);

  const { crudContextAction } = useCrudContext();
  const { panel, collapsedBox, readBox } = crudContextAction;

  let source = request.source();
  const { result, isLoading, isSuccess } = useSelector(selectSearchedItems);

  const isTyping = useRef(false);

  let delayTimer = null;
  useEffect(() => {
    isLoading && setOptions([{ label: '... Searching', value: 'searching' }]);
  }, [isLoading]);

  const onSearch = useCallback(
    searchText => {
      isTyping.current = true;

      clearTimeout(delayTimer);
      delayTimer = setTimeout(function () {
        if (isTyping.current && searchText !== '') {
          dispatch(
            crud.search(entity, source, {
              question: searchText,
              fields: searchFields,
            })
          );
        }
        isTyping.current = false;
      }, 500);
    },
    [dispatch, entity, source, searchFields]
  );

  const onSelect = useCallback(
    data => {
      const currentItem = result.find(item => {
        return item[outputValue] === data;
      });

      dispatch(crud.currentItem(currentItem));
      panel.open();
      collapsedBox.open();
      readBox.open();
    },
    [dispatch, result, outputValue, panel, collapsedBox, readBox]
  );

  const onChange = useCallback(
    data => {
      const currentItem = options.find(item => {
        return item.value === data;
      });
      const currentValue = currentItem ? currentItem.label : data;
      setValue(currentValue);
    },
    [options]
  );

  useEffect(() => {
    const optionResults = result.map(item => {
      const labels = displayLabels.map(x => item[x]).join(' ');
      return { label: labels, value: item[outputValue] };
    });

    setOptions(optionResults);
  }, [result, displayLabels, outputValue]);

  const notFoundContent = useMemo(
    () => (!isSuccess ? <Empty style={{ color: '#6B6B6B' }} /> : ''),
    [isSuccess]
  );

  return (
    <AutoComplete
      value={value}
      options={options}
      style={{ width: '100%' }}
      onSelect={onSelect}
      onSearch={onSearch}
      onChange={onChange}
      notFoundContent={notFoundContent}
      allowClear={true}
      placeholder="Search..."
      dropdownStyle={styles.dropdown}
    >
      <Input suffix={<SearchOutlined style={styles.searchIcon} />} style={styles.input} />
    </AutoComplete>
  );
}

const SearchItem = React.memo(SearchItemComponent);

export default SearchItem;

const styles = {
  input: {
    height: 44,
    background: 'rgba(31, 31, 31, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    fontSize: 14,
    color: '#FAFAFA',
  },
  searchIcon: {
    color: '#6B6B6B',
    fontSize: 16,
  },
  dropdown: {
    background: 'rgba(30, 30, 30, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    padding: '6px',
  },
};
