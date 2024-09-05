// IndexedDBContext.tsx
import React, {createContext, useContext, useState, useEffect, useCallback} from 'react';

interface DBConfig {
    dbName: string;
    storeName: string;
    version?: number;
}

interface IndexedDBContextProps {
    addItem: (item: any) => void;
    deleteItem: (id: number | string) => void;
    updateItem: (item: any) => void;
    clearStore: () => void;
    getAllItems: () => Promise<any[]>;
    getItem: (id: number | string) => Promise<any>;
    switchDB: (newConfig: DBConfig) => Promise<void>;
    isDBReady: boolean;
}

const IndexedDBContext = createContext<IndexedDBContextProps | undefined>(undefined);

export const useIndexedDBContext = () => {
    const context = useContext(IndexedDBContext);
    if (!context) {
        throw new Error('useIndexedDBContext must be used within an IndexedDBProvider');
    }
    return context;
};

export const IndexedDBProvider: React.FC<{ initialConfig: DBConfig, children: React.ReactNode }> = ({
                                                                                                        initialConfig,
                                                                                                        children
                                                                                                    }) => {
    const [db, setDb] = useState<IDBDatabase | null>(null);
    const [isDBReady, setIsDBReady] = useState(false);
    const [config, setConfig] = useState<DBConfig>(initialConfig);

    // 初始化数据库
    const initializeDB = useCallback(({dbName, storeName, version = 1}: DBConfig): Promise<IDBDatabase> => {
        setIsDBReady(false); // 开始初始化，标记未准备好
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, version);

            request.onupgradeneeded = () => {
                const database = request.result;
                if (!database.objectStoreNames.contains(storeName)) {
                    database.createObjectStore(storeName, {keyPath: 'id', autoIncrement: true});
                }
            };

            request.onsuccess = () => {
                const database = request.result;
                setDb(database);
                setIsDBReady(true); // 初始化成功，标记已准备好
                resolve(database);
            };

            request.onerror = () => {
                console.error('IndexedDB 初始化失败', request.error);
                setIsDBReady(false); // 初始化失败，标记未准备好
                reject(request.error);
            };
        });
    }, []);

    // 切换数据库或存储表
    const switchDB = useCallback((newConfig: DBConfig): Promise<void> => {
        if (db) {
            db.close(); // 关闭当前数据库连接
        }
        setConfig(newConfig);
        return initializeDB(newConfig)
            .then(database => {
                setDb(database); // 设置新的数据库实例
            })
            .catch(error => {
                console.error('切换数据库失败', error);
            });
    }, [db, initializeDB]);

    useEffect(() => {
        if (config.dbName && config.storeName) {
            initializeDB(config).then(setDb).catch(console.error);
        }
    }, [config, initializeDB]);

    // 检查数据库是否准备好
    const ensureDBReady = useCallback((): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (isDBReady && db) {
                resolve();
            } else {
                reject(new Error('数据库未初始化或尚未准备好'));
            }
        });
    }, [isDBReady, db]);

    // 数据操作方法
    const addItem = useCallback(
        (item: any) => {
            ensureDBReady().then(() => {
                const transaction = db!.transaction(config.storeName, 'readwrite');
                const store = transaction.objectStore(config.storeName);
                const request = store.add(item);

                request.onsuccess = () => {
                    console.log('数据添加成功');
                };

                request.onerror = () => {
                    console.error('添加数据时出错', request.error);
                };
            }).catch(error => console.error('添加数据失败:', error.message));
        },
        [db, config.storeName, ensureDBReady]
    );

    const deleteItem = useCallback(
        (id: number | string) => {
            ensureDBReady().then(() => {
                const transaction = db!.transaction(config.storeName, 'readwrite');
                const store = transaction.objectStore(config.storeName);
                const request = store.delete(id);

                request.onsuccess = () => {
                    console.log('数据删除成功');
                };

                request.onerror = () => {
                    console.error('删除数据时出错', request.error);
                };
            }).catch(error => console.error('删除数据失败:', error.message));
        },
        [db, config.storeName, ensureDBReady]
    );

    const updateItem = useCallback(
        (item: any) => {
            ensureDBReady().then(() => {
                const transaction = db!.transaction(config.storeName, 'readwrite');
                const store = transaction.objectStore(config.storeName);
                const request = store.put(item);

                request.onsuccess = () => {
                    console.log('数据修改成功');
                };

                request.onerror = () => {
                    console.error('修改数据时出错', request.error);
                };
            }).catch(error => console.error('修改数据失败:', error.message));
        },
        [db, config.storeName, ensureDBReady]
    );

    const clearStore = useCallback(() => {
        ensureDBReady().then(() => {
            const transaction = db!.transaction(config.storeName, 'readwrite');
            const store = transaction.objectStore(config.storeName);
            const request = store.clear();

            request.onsuccess = () => {
                console.log('数据已清空');
            };

            request.onerror = () => {
                console.error('清空数据时出错', request.error);
            };
        }).catch(error => console.error('清空数据失败:', error.message));
    }, [db, config.storeName, ensureDBReady]);

    const getAllItems = useCallback((): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            ensureDBReady().then(() => {
                const transaction = db!.transaction(config.storeName, 'readonly');
                const store = transaction.objectStore(config.storeName);
                const request = store.getAll();

                request.onsuccess = () => {
                    resolve(request.result);
                };

                request.onerror = () => {
                    reject(request.error);
                };
            }).catch(reject);
        });
    }, [db, config.storeName, ensureDBReady]);

    const getItem = useCallback((id: number | string): Promise<any> => {
        return new Promise((resolve, reject) => {
            ensureDBReady().then(() => {
                const transaction = db!.transaction(config.storeName, 'readonly');
                const store = transaction.objectStore(config.storeName);
                const request = store.get(id);

                request.onsuccess = () => {
                    if (request.result !== undefined) {
                        resolve(request.result);
                    } else {
                        reject(new Error(`未找到ID为 ${id} 的数据`));
                    }
                };

                request.onerror = () => {
                    reject(request.error);
                };
            }).catch(reject);
        });
    }, [db, config.storeName, ensureDBReady]);

    return (
        <IndexedDBContext.Provider
            value={{addItem, deleteItem, updateItem, clearStore, getAllItems, getItem, switchDB, isDBReady}}>
            {children}
        </IndexedDBContext.Provider>
    );
};
