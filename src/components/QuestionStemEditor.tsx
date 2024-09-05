'use client'
import React, {useEffect, useState} from 'react';
import QuillEditor from "@/components/QuillEditor";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import Section from "@/components/Section";
import {message} from "antd";

interface QuestionStemEditorProps {
    value?: string;
    onChange?: (value: string) => void;
}

const QuestionStemEditor: React.FC<QuestionStemEditorProps> = ({ value = '', onChange }) => {
    const [localValue, setLocalValue] = useState(value);
    const [convertedValue, setConvertedValue] = useState('');

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (content: string) => {
        setLocalValue(content);
        setConvertedValue(content)
        onChange?.(content);  // 将更改传递到外部
    };

    const handleConvertClick = () => {
        setConvertedValue(localValue);
        onChange?.(localValue);  // 同步更新
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setConvertedValue(e.target.value);
        onChange?.(e.target.value);
    };

    const handleCopyClick = () => {
        navigator.clipboard.writeText(convertedValue).then(() => {
            message.success("Copied to clipboard");
        }).catch(() => {
            message.error("Failed to copy");
        });
    };

    return (
        <div className='w-full flex gap-2 items-center mb-6'>
            <QuillEditor value={localValue} onChange={handleChange} />
            <div className='flex flex-col gap-2 text-center'>
                <Button type='button' className='mx-2' onClick={handleConvertClick}>Convert</Button>
                <Button type='button' className='mx-2 bg-green-500 hover:bg-green-400' onClick={handleCopyClick}>Copy</Button>
            </div>
            <Textarea disabled className='h-72' value={convertedValue} onChange={handleTextareaChange} />
        </div>
    );
};

export default QuestionStemEditor;