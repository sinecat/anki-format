import React from 'react';
import {cn} from "@/lib/utils";

const Section = (props: { children: React.ReactNode,vertical?: boolean }) => {
    const {children} = props;
    return (
        <div className={cn('mx-auto p-8 w-[80rem] flex justify-center items-center',{
            'flex-col': props.vertical
        })}>
            {children}
        </div>
    );
};

export default Section;