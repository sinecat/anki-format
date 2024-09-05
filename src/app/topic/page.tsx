import React from 'react';
import {ClientOnly} from "@/components/ClientOnly";
import TopicEditorTable from "@/components/topic/TopicEditorTable";

const TopicPage = () => {
    return (
        <ClientOnly>
            <TopicEditorTable/>
        </ClientOnly>
    );
};

export default TopicPage;