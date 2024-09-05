import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // 引入样式文件

interface QuillEditorPorps {
    value: string;
    onChange: (content: string) => void;
}

const QuillEditor = (props: QuillEditorPorps) => {
    const {value, onChange} = props;

    return (
        <ReactQuill className='w-full h-64 mb-10' value={value} onChange={onChange}/>
    );
};

export default QuillEditor;