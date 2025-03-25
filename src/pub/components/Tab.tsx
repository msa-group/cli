import React, { useState, useEffect, ReactNode } from "react";

export interface TabItem {
  key: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultActiveKey?: string;
  activeKey?: string;
  onChange?: (activeKey: string) => void;
  className?: string;
  tabClassName?: string;
  contentClassName?: string;
}

const Tabs: React.FC<TabsProps> = ({
  items,
  defaultActiveKey,
  activeKey,
  onChange,
  className = "",
  tabClassName = "",
  contentClassName = "",
}) => {
  const isControlled = typeof activeKey !== 'undefined';
  const [internalActiveKey, setInternalActiveKey] = useState<string>(
    defaultActiveKey || (items.length > 0 ? items[0].key : "")
  );

  const currentActiveKey = isControlled ? activeKey : internalActiveKey;

  useEffect(() => {
    if (isControlled && activeKey) {
      setInternalActiveKey(activeKey);
    }
  }, [activeKey, isControlled]);

  const handleTabClick = (key: string) => {
    if (key !== currentActiveKey) {
      !isControlled && setInternalActiveKey(key);
      onChange && onChange(key);
    }
  };

  return (
    <div className={`tabs-container ${className}`}>
      <div className="tabs-header">
        {items.map((item) => (
          <div
            key={item.key}
            className={`tab-item ${tabClassName} ${
              currentActiveKey === item.key ? "active" : ""
            } ${item.disabled ? "disabled" : ""}`}
            onClick={() => !item.disabled && handleTabClick(item.key)}
          >
            {item.label}
          </div>
        ))}
      </div>
      <div className={`tabs-content ${contentClassName}`}>
        {items.find((item) => item.key === currentActiveKey)?.content}
      </div>
    </div>
  );
};

export default Tabs;
