'use client'
import React, {useEffect, useState} from 'react';
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {useSelectedLayoutSegment,useRouter} from "next/navigation";
import {navItems} from "@/config/nav";

const MainNav = () => {
    const selectedLayoutSegment = useSelectedLayoutSegment();
    const pathname = selectedLayoutSegment ? `/${selectedLayoutSegment}` : '/';
    const router = useRouter()

    const [currentPath, setCurrentPath] = useState(pathname);

    const handleValueChange = (val: string) => {
        router.push(val)
        setCurrentPath(val)
    }

    useEffect(() => {
        setCurrentPath(pathname)
    }, [pathname]);
    
    return (
        <div className="w-full flex justify-center">
            <Tabs defaultValue="questionStem" value={currentPath} onValueChange={handleValueChange}>
                <TabsList>
                    {
                        navItems.map((item)=>(
                            <TabsTrigger key={item.path} value={item.path}>{item.title}</TabsTrigger>
                        ))
                    }
                </TabsList>
            </Tabs>
        </div>
    );
};

export default MainNav;