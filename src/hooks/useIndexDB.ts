import { useState, useEffect, useCallback } from 'react';
import {message} from "antd";

interface DBConfig {
    dbName: string;
    storeName: string;
    version?: number;
}

const useIndexedDB = (initialConfig: DBConfig) => {
    const [db, setDb] = useState<IDBDatabase | null>(null);
    const [isDBReady, setIsDBReady] = useState(false);
    const [config, setConfig] = useState<DBConfig>(initialConfig);

    // 初始化数据库
    const initializeDB = useCallback(({ dbName, storeName, version = 1 }: DBConfig): Promise<IDBDatabase> => {
        setIsDBReady(false); // 开始初始化，标记未准备好
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, version);

            request.onupgradeneeded = () => {
                const database = request.result;
                if (!database.objectStoreNames.contains(storeName)) {
                    database.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
                }
            };

            request.onsuccess = () => {
                const database = request.result;
                setDb(database);
                setIsDBReady(true); // 初始化成功，标记已准备好
                resolve(database);
            };

            request.onerror = () => {
                message.error('IndexedDB 初始化失败');
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
                message.error('切换数据库失败');
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
                message.error('数据库未初始化或尚未准备好');
                reject(new Error('数据库未初始化或尚未准备好'));
            }
        });
    }, [isDBReady, db]);

    // 添加数据
    const addItem = useCallback(
        (item: any) => {
            ensureDBReady().then(() => {
                const transaction = db!.transaction(config.storeName, 'readwrite');
                const store = transaction.objectStore(config.storeName);
                const request = store.add(item);

                request.onsuccess = () => {
                    message.success('添加数据成功');
                };

                request.onerror = () => {
                    message.error('添加数据时出错\n'+request.error);
                };
            }).catch(error => message.error('添加数据失败:'+error.message));
        },
        [db, config.storeName, ensureDBReady]
    );

    // 删除数据
    const deleteItem = useCallback(
        (id: number | string) => {
            ensureDBReady().then(() => {
                const transaction = db!.transaction(config.storeName, 'readwrite');
                const store = transaction.objectStore(config.storeName);
                const request = store.delete(id);

                request.onsuccess = () => {
                    message.success('删除数据成功');
                };

                request.onerror = () => {
                    message.error('删除数据时出错\n'+request.error);
                };
            }).catch(error => message.error('删除数据失败\n'+error.message));
        },
        [db, config.storeName, ensureDBReady]
    );

    // 修改数据
    const updateItem = useCallback(
        (item: any) => {
            ensureDBReady().then(() => {
                const transaction = db!.transaction(config.storeName, 'readwrite');
                const store = transaction.objectStore(config.storeName);
                const request = store.put(item);

                request.onsuccess = () => {
                    message.success('修改数据成功');
                };

                request.onerror = () => {
                    message.error('修改数据时出错\n'+request.error);
                    console.error('修改数据时出错', request.error);
                };
            }).catch(error => message.error('修改数据失败\n'+error.message));
        },
        [db, config.storeName, ensureDBReady]
    );

    // 清空数据库表
    const clearStore = useCallback(() => {
        ensureDBReady().then(() => {
            const transaction = db!.transaction(config.storeName, 'readwrite');
            const store = transaction.objectStore(config.storeName);
            const request = store.clear();

            request.onsuccess = () => {
                message.success('清空数据成功');
            };

            request.onerror = () => {
                message.error('清空数据时出错\n'+request.error);
            };
        }).catch(error => message.error('清空数据失败\n'+error.message));
    }, [db, config.storeName, ensureDBReady]);

    // 获取所有数据
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
                    message.error('获取数据时出错\n'+request.error);
                    reject(request.error);
                };
            }).catch(reject);
        });
    }, [db, config.storeName, ensureDBReady]);

    // 获取单个数据项
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
                        message.error(`未找到ID为 ${id} 的数据`);
                        reject(new Error(`未找到ID为 ${id} 的数据`));
                    }
                };

                request.onerror = () => {
                    reject(request.error);
                };
            }).catch(reject);
        });
    }, [db, config.storeName, ensureDBReady]);

    return {
        addItem,
        deleteItem,
        updateItem,
        clearStore,
        getAllItems,
        getItem,
        switchDB,
        isDBReady,
    };
};

export default useIndexedDB;
