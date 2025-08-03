// src/components/ChatPanel/SettingsPanel.jsx

import React, { useEffect } from 'react';
import { Modal, Form, Select, InputNumber } from 'antd';

// 组件现在接收 settings (当前设置值) 和 onSettingsChange (设置改变时的回调函数)
function SettingsPanel({ visible, onClose, settings, onSettingsChange }) {
  const [form] = Form.useForm();

  // 使用 useEffect 来确保当外部 settings prop 变化时，表单能同步显示正确的值
  useEffect(() => {
    if (visible) {
      form.setFieldsValue(settings);
    }
  }, [visible, settings, form]);

  return (
    <Modal
      title="设置"
      open={visible}
      onOk={onClose}
      onCancel={onClose}
      width={600}
    >
      {/* 【核心改动】
        1. `initialValues` prop 被移除，改用 useEffect 进行同步。
        2. `onValuesChange` prop 会在任何表单项变化时被调用。
           我们用它来调用父组件传来的 onSettingsChange 函数，将变化的值传回父组件。
      */}
      <Form
        form={form}
        layout="vertical"
        onValuesChange={(changedValues, allValues) => {
          onSettingsChange(allValues);
        }}
      >
        <Form.Item label="发送键" name="sendKey">
          <Select>
            <Select.Option value="Enter">Enter</Select.Option>
            <Select.Option value="Ctrl+Enter">Ctrl + Enter</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="字体大小" name="fontSize">
          <InputNumber min={12} max={20} addonAfter="px" />
        </Form.Item>
        {/* 其他暂时不起作用的设置项可以保留UI */}
        <Form.Item label="主题" name="theme">
          <Select disabled>
            <Select.Option value="auto">自动</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default SettingsPanel;