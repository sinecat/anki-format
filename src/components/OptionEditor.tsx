'use client'
import React, {useEffect, useState} from 'react';
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import Section from "@/components/Section";
import {message} from "antd";
import {formatOptions} from "@/lib/utils";

interface OptionEditorProps {
    value?: string;
    onChange?: (value: string) => void;
}

const OptionEditor: React.FC<OptionEditorProps> = ({ value = '', onChange }) => {
    const [localValue, setLocalValue] = useState(value);
    const [convertedValue, setConvertedValue] = useState('');

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = event.target.value;
        setLocalValue(val);
        setConvertedValue(val)
        onChange?.(val);  // 更新表单中的值
    };

    const handleConvertClick = () => {
        const data = formatOptions(localValue);
        setConvertedValue(data);
        onChange?.(data);  // 更新表单中的值
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
        <div className='w-full flex gap-2 items-center'>
            <Textarea className='h-72' value={localValue} onChange={handleChange} />
            <div className='flex flex-col gap-2 text-center'>
                <Button type='button' className='mx-2' onClick={handleConvertClick}>Convert</Button>
                <Button type='button' className='mx-2 bg-green-500 hover:bg-green-400' onClick={handleCopyClick}>Copy</Button>
            </div>
            <Textarea className='h-72' value={convertedValue} onChange={handleTextareaChange} />
        </div>
    );
};

export default OptionEditor;