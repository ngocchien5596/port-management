import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient().$extends({
    query: {
        $allModels: {
            async $allOperations({ model, operation, args, query }) {
                const shiftDate = (date: any) => {
                    if (date instanceof Date) {
                        return new Date(date.getTime() + 7 * 60 * 60 * 1000);
                    }
                    return date;
                };

                const unshiftDate = (date: any) => {
                    if (date instanceof Date) {
                        return new Date(date.getTime() - 7 * 60 * 60 * 1000);
                    }
                    return date;
                };

                // Non-mutating processArgs with key propagation
                const transformArgs = (obj: any): any => {
                    if (!obj || typeof obj !== 'object') return obj;

                    if (Array.isArray(obj)) {
                        return obj.map(item => transformArgs(item));
                    }

                    const newObj: any = {};
                    for (const key in obj) {
                        const value = obj[key];
                        if (value instanceof Date) {
                            newObj[key] = shiftDate(value);
                        } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                            // Also shift date strings (common in API requests)
                            const d = new Date(value);
                            if (!isNaN(d.getTime())) {
                                newObj[key] = shiftDate(d);
                            } else {
                                newObj[key] = value;
                            }
                        } else if (typeof value === 'object' && value !== null) {
                            newObj[key] = transformArgs(value);
                        } else {
                            newObj[key] = value;
                        }
                    }
                    return newObj;
                };

                const transformResult = (obj: any): any => {
                    if (!obj || typeof obj !== 'object') return obj;

                    if (Array.isArray(obj)) {
                        return obj.map(item => transformResult(item));
                    }

                    const newObj: any = {};
                    for (const key in obj) {
                        const value = obj[key];
                        if (value instanceof Date) {
                            newObj[key] = unshiftDate(value);
                        } else if (typeof value === 'object' && value !== null) {
                            newObj[key] = transformResult(value);
                        } else {
                            newObj[key] = value;
                        }
                    }
                    return newObj;
                };

                // Clone and prepare args
                let newArgs = { ...args };

                // Inject timestamps for write operations
                if (['create', 'update', 'upsert', 'createMany', 'updateMany'].includes(operation)) {
                    const now = new Date();

                    const inject = (obj: any): any => {
                        if (!obj || typeof obj !== 'object') return obj;
                        const newObj = { ...obj };

                        const fullTimestampModels = [
                            'CargoType', 'Lane', 'Equipment', 'Employee', 'Account',
                            'Vessel', 'Crane',
                            'CapabilityMatrix', 'Product', 'Voyage'
                        ];

                        const creationOnlyTimestampModels = [
                            'Incident', 'VoyageEvent', 'VoyageProgress', 'Alert', 'Notification'
                        ];

                        // Handle models with createdAt/updatedAt
                        if (model) {
                            if (fullTimestampModels.includes(model) || creationOnlyTimestampModels.includes(model)) {
                                if (operation === 'create' || (operation === 'upsert' && obj === (args as any)?.create)) {
                                    if ((newObj as any).createdAt === undefined) (newObj as any).createdAt = now;
                                }
                            }

                            if (fullTimestampModels.includes(model)) {
                                if ((newObj as any).updatedAt === undefined) (newObj as any).updatedAt = now;
                            }
                        }

                        return newObj;
                    };

                    if (operation === 'upsert') {
                        const _args = args as any;
                        if (_args.create) (newArgs as any).create = inject(_args.create);
                        if (_args.update) (newArgs as any).update = inject(_args.update);
                    } else if ((args as any)?.data) {
                        const _args = args as any;
                        if (Array.isArray(_args.data)) {
                            (newArgs as any).data = _args.data.map(inject);
                        } else {
                            (newArgs as any).data = inject(_args.data);
                        }
                    }
                }

                // Apply date shifting to the cloned/injected args
                newArgs = transformArgs(newArgs);

                const result = await query(newArgs);

                return transformResult(result);
            },
        },
    },
});

export default prisma;
