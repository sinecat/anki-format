import React, {useContext, useEffect} from 'react';
import {Button, Drawer, Modal} from "antd";
import {DBContext, DBContextType} from "@/components/topic/TopicEditorTable";
import {ProForm, ProFormSelect, ProFormText, ProFormTextArea} from "@ant-design/pro-components";
import Card from "antd/es/card/Card";
import OptionEditor from "@/components/OptionEditor";
import QuestionStemEditor from "@/components/QuestionStemEditor";

interface EditorDrawerProps {
    open: boolean;
    onOpenChange: (val: boolean) => void;
    id?: string;
    onFinish: (data: FormData) => void;
}

const EditorDrawer = (props: EditorDrawerProps) => {
    const {id, open, onFinish, onOpenChange} = props
    const DBUtils = useContext(DBContext) as DBContextType;
    const [modal, contextHolder] = Modal.useModal();

    const [proFormRef] = ProForm.useForm();

    const clearForm = () => {
        proFormRef.resetFields()
    }

    const handleFormatQuestionStem = () => {
        // 获取题干
        const questionStem = proFormRef.getFieldValue('questionStem')
        // 去除空格
        const formatQuestionStem = questionStem.replace(/\s+/g, '')
        // 设置题干
        proFormRef.setFieldsValue({questionStem: formatQuestionStem})
    }

    const handleFinish = (values: FormData) => {
        modal.confirm({
            title: '提示',
            content: '确定要保存吗？',
            onOk: () => {
                onFinish?.(values)
                clearForm()
            },
        })
    };

    useEffect(() => {
        clearForm()
        if (id) {
            DBUtils.getItem(id).then((data: any) => {
                if (data) {
                    proFormRef.setFieldsValue(data)
                }
            })
        }
    }, [id]);
    return (
        // 可以使用modelForm
        <Drawer width={840} title="编辑" onClose={() => onOpenChange(false)} open={open}>
            <Card>
                <ProForm
                    onFinish={handleFinish}
                    form={proFormRef}
                    submitter={{
                        render: () => (
                            <div className='flex justify-end gap-2'>
                                <Button
                                    onClick={() => onOpenChange(false)}
                                >
                                    取消
                                </Button>
                                <Button
                                    key="back"
                                    onClick={handleFormatQuestionStem}
                                >
                                    题干去除空格
                                </Button>
                                <Button
                                    key="submit"
                                    type="primary"
                                    onClick={() => proFormRef?.submit()}
                                >
                                    {id ? '修改' : '新增'}
                                </Button>
                            </div>
                        ),
                    }}
                >
                    <ProFormText required name="id" label="id(如：第一组第一题用1-1)"/>
                    <ProFormText required name="provenance" label="出处"/>
                    <ProFormTextArea required name="questionStem" label="题干"/>
                    <ProFormTextArea required name="topic" label="题目"/>
                    <ProForm.Item required name="options" label="选项">
                        <OptionEditor/>
                    </ProForm.Item>
                    <ProFormSelect required name="answer" label="答案"
                                   options={[
                                       {
                                           value: 'A',
                                           label: 'A'
                                       },
                                       {
                                           value: 'B',
                                           label: 'B'
                                       },
                                       {
                                           value: 'C',
                                           label: 'C'
                                       },
                                       {
                                           value: 'D',
                                           label: 'D'
                                       }
                                   ]}
                    />
                    <ProForm.Item required name="analyze" label="解析">
                        <QuestionStemEditor/>
                    </ProForm.Item>
                </ProForm>
            </Card>
            {contextHolder}
        </Drawer>
    );
};

export default EditorDrawer;