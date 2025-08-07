// src/components/ChatPanel/SettingsPanel.jsx

import React, { useEffect } from 'react';
import { Modal, Form, Select, InputNumber} from 'antd';

// 组件现在接收 settings 和 onSettingsChange
function SettingsPanel({ visible, onClose, settings, onSettingsChange }) {
  const [form] = Form.useForm();

  // 当外部传入的settings变化时，同步更新表单内部的值
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
      destroyOnClose // 关闭时销毁内部组件，避免状态问题
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={settings}
        // 当表单内任何一项发生变化时，调用onSettingsChange通知父组件
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
        {/* 这里可以继续添加您截图中的其他设置项 */}
      </Form>
    </Modal>
  );
}

export default SettingsPanel;