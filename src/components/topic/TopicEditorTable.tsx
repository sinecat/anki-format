'use client'
import React, {createContext, useEffect, useState} from 'react';
import {Button, Card, Modal, Space, Table, TableProps} from "antd";
import Section from "@/components/Section";
import EditorDrawer from "@/components/topic/EditorDrawer";
import useIndexedDB from "@/hooks/useIndexDB";
import {exportToExcel} from "@/lib/exportExcel";

interface DataType {
    id: string;
    provenance: string;
    topic: string;
    answer: string;
}

const data: DataType[] = [
    {
        id: '1-1',
        provenance: '2018福建',
        topic: '1',
        answer: 'A'
    }
]

export type DBContextType = {
    getItem: (id: string) => any;
    updateItem: (item: any) => void;
};

export const DBContext = createContext<DBContextType | undefined>({
    getItem: (id) => {
    },
    updateItem: (item) => {
    },
});

const TopicEditorTable = () => {
    const [modal, contextHolder] = Modal.useModal();

    const [drawerOpen, setDrawerOpen] = useState(false)
    const [listData, setListData] = useState<DataType[]>(data)
    const [checkedEditId, setCheckedEditId] = useState<string>('')
    const [editType, setEditType] = useState<'add' | 'edit'>('add')
    const {isDBReady, addItem, updateItem, clearStore, getAllItems, getItem,deleteItem} = useIndexedDB({
        dbName: 'QuestionBase',
        storeName: 'Store1'
    });

    const handleEditClick = (id: string) => {
        setCheckedEditId(id)
        setDrawerOpen(true)
        setEditType('edit')
    }

    const handleDeleteClick = (id: string) => {
        // 删除数据
        modal.confirm({
            title: '提示',
            content: '确定要删除吗？',
            onOk: () => {
                deleteItem(id)
                loadData()
            },
        })
    }

    const handleAddClick = () => {
        setDrawerOpen(true)
        setEditType('add')
        setCheckedEditId('')
    }

    const handleExportClick = () => {
        exportToExcel(listData)
    }

    const handleFinish = (data: FormData) => {
        if (editType === 'add') {
            addItem(data)
        } else {
            updateItem(data)
        }
        setDrawerOpen(false)
        loadData()
    }

    const columns: TableProps<DataType>['columns'] = [
        {
            title: 'id',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'provenance',
            dataIndex: 'provenance',
            key: 'provenance',
        },
        {
            title: 'topic',
            dataIndex: 'topic',
            key: 'topic',
        },
        {
            title: 'answer',
            dataIndex: 'answer',
            key: 'answer',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <a onClick={() => handleEditClick(record.id)}>Edit</a>
                    <a onClick={() => handleDeleteClick(record.id)}>Delete</a>
                </Space>
            ),
        },
    ]

    const loadData = () => {
        getAllItems().then(res => {
            setListData(res)
        })
    }

    const handleDeleteAll = () => {
        modal.confirm({
            title: '提示',
            content: '确定要清空所有数据吗？',
            onOk: () => {
                clearStore()
                loadData()
            },
        })
    }

    useEffect(() => {
        if (isDBReady) {
            getAllItems().then(res => {
                console.log('res', res)
                setListData(res)
            })
        }
    }, [getAllItems, isDBReady]);

    return (
        <Section vertical={true}>
            <Card style={{width: '100%'}}>
                <div className='w-full flex gap-2 mb-2 justify-end items-center'>
                    <Button type="primary" onClick={handleDeleteAll}>清空数据</Button>
                    <Button onClick={handleAddClick}>添加数据</Button>
                    <Button type="primary" onClick={handleExportClick}>导出excel</Button>
                </div>
                <DBContext.Provider value={{getItem: getItem, updateItem: updateItem}}>
                    <Table className='w-full' columns={columns} dataSource={listData} rowKey={'id'}/>
                    <EditorDrawer open={drawerOpen} onOpenChange={setDrawerOpen} id={checkedEditId}
                                  onFinish={handleFinish}/>
                </DBContext.Provider>
            </Card>
            {contextHolder}
        </Section>
    );
};

export default TopicEditorTable;