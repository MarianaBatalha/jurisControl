import { MOCK_PROCESSES, MOCK_PAYMENTS, MOCK_USERS } from './data/mockData';
import { Process, Payment, ProcessFormData, PaymentFormData, PaymentStatus, ProcessStatus, User, UserFormData, UserRole, UserStatus, PaymentOrigin } from './types';

// Simulate network latency
const LATENCY = 500;
export const PAGE_SIZE = 6;

let processes: Process[] = [...MOCK_PROCESSES];
let payments: Payment[] = [...MOCK_PAYMENTS];
let users: User[] = [...MOCK_USERS];


// --- Auth API ---
export const login = async (email: string, password: string):Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, LATENCY * 2));
    const user = users.find(u => u.email === email);
    
    // Check user-specific password
    if (user && user.password === password) { 
        if (user.status !== UserStatus.Active) {
            throw new Error('Sua conta está inativa. Entre em contato com o administrador.');
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userToReturn } = user;
        return userToReturn as User;
    }
    throw new Error('Credenciais inválidas');
};


const findProcess = (id: string) => {
    const process = processes.find(p => p.id === id);
    if (!process) throw new Error('Process not found');
    return process;
};

const findPayment = (id:string) => {
    const payment = payments.find(p => p.id === id);
    if (!payment) throw new Error('Payment not found');
    return payment;
}

const checkOverdue = (payment: Payment | PaymentFormData): boolean => {
    const dueDate = new Date(payment.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare dates only
    return dueDate < today && payment.status !== PaymentStatus.Paid && payment.status !== PaymentStatus.Canceled;
};

// --- Processes API ---

type GetProcessesParams = {
    page: number;
    limit: number;
    searchQuery?: string;
    filters?: {
        status: ProcessStatus[];
        origin: PaymentOrigin[];
        minDate: string;
        maxDate: string;
        minValue: number | '';
        maxValue: number | '';
    };
    sortBy?: string;
}

const getFilteredSortedProcesses = (searchQuery?: string, filters?: GetProcessesParams['filters'], sortBy?: string): Process[] => {
    let filteredData = processes;

    // Apply search
    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        filteredData = filteredData.filter(p => 
            p.processNumber.toLowerCase().includes(lowercasedQuery) ||
            p.claimant.toLowerCase().includes(lowercasedQuery) ||
            p.company.toLowerCase().includes(lowercasedQuery) ||
            (p.lawyer && p.lawyer.toLowerCase().includes(lowercasedQuery))
        );
    }

    // Apply filters
    if (filters) {
        if (filters.status.length > 0) {
            filteredData = filteredData.filter(p => filters.status.includes(p.status));
        }
        if (filters.origin && filters.origin.length > 0) {
            filteredData = filteredData.filter(p => filters.origin.includes(p.origin));
        }
        if (filters.minDate) {
            filteredData = filteredData.filter(p => new Date(p.distributionDate) >= new Date(filters.minDate));
        }
        if (filters.maxDate) {
            filteredData = filteredData.filter(p => new Date(p.distributionDate) <= new Date(filters.maxDate));
        }
        if (filters.minValue !== '') {
            filteredData = filteredData.filter(p => p.caseValue >= Number(filters.minValue));
        }
        if (filters.maxValue !== '') {
            filteredData = filteredData.filter(p => p.caseValue <= Number(filters.maxValue));
        }
    }

    // Apply sorting
    return [...filteredData].sort((a, b) => {
        switch (sortBy) {
            case 'date_asc':
                return new Date(a.distributionDate).getTime() - new Date(b.distributionDate).getTime();
            case 'value_desc':
                return b.caseValue - a.caseValue;
            case 'value_asc':
                return a.caseValue - b.caseValue;
            case 'claimant_asc':
                return a.claimant.localeCompare(b.claimant);
            case 'date_desc':
            default:
                return new Date(b.distributionDate).getTime() - new Date(a.distributionDate).getTime();
        }
    });
};

export const getProcesses = async ({ page, limit, searchQuery, filters, sortBy }: GetProcessesParams): Promise<{ data: Process[]; total: number }> => {
    await new Promise(resolve => setTimeout(resolve, LATENCY));
    const allMatchingData = getFilteredSortedProcesses(searchQuery, filters, sortBy);
    const total = allMatchingData.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = allMatchingData.slice(startIndex, startIndex + limit);
    return { data: paginatedData, total };
};

export const exportProcesses = async ({ searchQuery, filters, sortBy }: Omit<GetProcessesParams, 'page' | 'limit'>): Promise<Process[]> => {
    await new Promise(resolve => setTimeout(resolve, LATENCY * 2)); // longer latency for export
    return getFilteredSortedProcesses(searchQuery, filters, sortBy);
};


export const createProcess = async (data: ProcessFormData): Promise<Process> => {
    await new Promise(resolve => setTimeout(resolve, LATENCY));
    const newProcess: Process = {
        id: `p${Date.now()}`,
        ...data,
    };
    processes = [newProcess, ...processes];
    return newProcess;
};

export const updateProcess = async (id: string, data: ProcessFormData): Promise<Process> => {
    await new Promise(resolve => setTimeout(resolve, LATENCY));
    const process = findProcess(id);
    const updatedProcess = { ...process, ...data };
    processes = processes.map(p => p.id === id ? updatedProcess : p);
    return updatedProcess;
};

export const deleteProcess = async (id: string): Promise<{ id: string }> => {
    await new Promise(resolve => setTimeout(resolve, LATENCY));
    findProcess(id);
    processes = processes.filter(p => p.id !== id);
    return { id };
};

// --- Payments API ---

type GetPaymentsParams = {
    page: number;
    limit: number;
    searchQuery?: string;
    filters?: {
        status: PaymentStatus[];
        type: string[];
        origin: PaymentOrigin[];
        minDueDate: string;
        maxDueDate: string;
        minValue: number | '';
        maxValue: number | '';
    };
    sortBy?: string;
}

const getFilteredSortedPayments = (searchQuery?: string, filters?: GetPaymentsParams['filters'], sortBy?: string): Payment[] => {
    let allPaymentsWithStatus = payments.map(p => ({ ...p, isOverdue: checkOverdue(p) }));
    let filteredData = allPaymentsWithStatus;

    // Apply search
    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        filteredData = filteredData.filter(p => 
            p.processNumber.toLowerCase().includes(lowercasedQuery) ||
            p.type.toLowerCase().includes(lowercasedQuery)
        );
    }
    
    // Apply filters
    if (filters) {
        if (filters.status.length > 0) {
            filteredData = filteredData.filter(p => filters.status.includes(p.status));
        }
        if (filters.type.length > 0) {
            filteredData = filteredData.filter(p => filters.type.includes(p.type));
        }
        if (filters.origin.length > 0) {
            filteredData = filteredData.filter(p => filters.origin.includes(p.origin));
        }
        if (filters.minDueDate) {
            filteredData = filteredData.filter(p => new Date(p.dueDate) >= new Date(filters.minDueDate));
        }
        if (filters.maxDueDate) {
            filteredData = filteredData.filter(p => new Date(p.dueDate) <= new Date(filters.maxDueDate));
        }
        if (filters.minValue !== '') {
            filteredData = filteredData.filter(p => p.value >= Number(filters.minValue));
        }
        if (filters.maxValue !== '') {
            filteredData = filteredData.filter(p => p.value <= Number(filters.maxValue));
        }
    }

    // Apply sorting
    return [...filteredData].sort((a, b) => {
        switch (sortBy) {
            case 'due_date_asc':
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            case 'value_desc':
                return b.value - a.value;
            case 'value_asc':
                return a.value - b.value;
            case 'due_date_desc':
            default:
                return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        }
    });
};

export const getPayments = async ({ page, limit, searchQuery, filters, sortBy }: GetPaymentsParams): Promise<{ data: Payment[]; total: number }> => {
    await new Promise(resolve => setTimeout(resolve, LATENCY));
    const allMatchingData = getFilteredSortedPayments(searchQuery, filters, sortBy);
    const total = allMatchingData.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = allMatchingData.slice(startIndex, startIndex + limit);
    return { data: paginatedData, total };
};

export const exportPayments = async ({ searchQuery, filters, sortBy }: Omit<GetPaymentsParams, 'page' | 'limit'>): Promise<Payment[]> => {
    await new Promise(resolve => setTimeout(resolve, LATENCY * 2));
    return getFilteredSortedPayments(searchQuery, filters, sortBy);
};


export const createPayment = async (data: PaymentFormData): Promise<Payment> => {
    await new Promise(resolve => setTimeout(resolve, LATENCY));
    const process = findProcess(data.processId);
    const newPayment: Payment = {
        id: `pay${Date.now()}`,
        ...data,
        processNumber: process.processNumber,
        isOverdue: checkOverdue(data),
    };
    payments = [newPayment, ...payments];
    return newPayment;
};

export const updatePayment = async (id: string, data: PaymentFormData): Promise<Payment> => {
    await new Promise(resolve => setTimeout(resolve, LATENCY));
    const payment = findPayment(id);
    const process = findProcess(data.processId);
    const updatedPayment = { ...payment, ...data, processNumber: process.processNumber, isOverdue: checkOverdue(data) };
    payments = payments.map(p => p.id === id ? updatedPayment : p);
    return updatedPayment;
};

export const deletePayment = async (id: string): Promise<{ id: string }> => {
    await new Promise(resolve => setTimeout(resolve, LATENCY));
    findPayment(id);
    payments = payments.filter(p => p.id !== id);
    return { id };
};

// --- Dashboard API (simplified, doesn't need pagination) ---
export const getAllProcesses = async (): Promise<Process[]> => {
    await new Promise(resolve => setTimeout(resolve, LATENCY / 2));
    return processes;
};

export const getAllPayments = async (): Promise<Payment[]> => {
    await new Promise(resolve => setTimeout(resolve, LATENCY / 2));
    return payments.map(p => ({ ...p, isOverdue: checkOverdue(p) }));
};

// --- Users API ---
const findUser = (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    return user;
};

type GetUsersParams = {
    page: number;
    limit: number;
    searchQuery?: string;
    filters?: {
        status: UserStatus[];
        role: UserRole[];
    };
    sortBy?: string;
}

// Helper to strip password from user object
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const stripPassword = ({ password, ...userWithoutPassword }: User): Omit<User, 'password'> => userWithoutPassword;


export const getUsers = async ({ page, limit, searchQuery, filters, sortBy }: GetUsersParams): Promise<{ data: User[], total: number }> => {
    await new Promise(resolve => setTimeout(resolve, LATENCY));
    
    let filteredData = users;

    // Apply search
    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        filteredData = filteredData.filter(u => 
            u.name.toLowerCase().includes(lowercasedQuery) ||
            u.email.toLowerCase().includes(lowercasedQuery)
        );
    }

    // Apply filters
    if (filters) {
        if (filters.role.length > 0) {
            filteredData = filteredData.filter(u => filters.role.includes(u.role));
        }
        if (filters.status.length > 0) {
            filteredData = filteredData.filter(u => filters.status.includes(u.status));
        }
    }

    // Apply sorting
    const sortedData = [...filteredData].sort((a, b) => {
        switch (sortBy) {
            case 'name_asc':
                return a.name.localeCompare(b.name);
            case 'name_desc':
                return b.name.localeCompare(a.name);
            case 'date_asc':
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case 'date_desc':
            default:
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
    });

    const total = sortedData.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = sortedData.slice(startIndex, startIndex + limit);

    // NOTE: In a real application, passwords should never be sent to the client.
    // This is for demonstration purposes only as requested.
    return { data: paginatedData, total };
};

export const createUser = async (data: UserFormData): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, LATENCY));
    if (users.some(u => u.email === data.email)) {
        throw new Error('Este e-mail já está em uso.');
    }
    const newUser: User = {
        id: `user${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        createdAt: new Date().toISOString(),
        password: data.password, // This would be hashed in a real app
    };
    users = [newUser, ...users];
    return stripPassword(newUser);
};

export const updateUser = async (id: string, data: Partial<UserFormData>): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, LATENCY));
    const user = findUser(id);
    if (data.email && users.some(u => u.email === data.email && u.id !== id)) {
        throw new Error('Este e-mail já está em uso.');
    }
    
    // Prepare data to update, excluding password fields initially
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, confirmPassword, ...updateData } = data;
    
    const updatedUser = { ...user, ...updateData };

    // If a new password is provided and is not empty, update it
    if (password) {
        updatedUser.password = password; // In a real app, this would be hashed
    }

    users = users.map(u => u.id === id ? updatedUser : u);
    return stripPassword(updatedUser);
};

export const deleteUser = async (id: string): Promise<{ id: string }> => {
    await new Promise(resolve => setTimeout(resolve, LATENCY));
    findUser(id);
    users = users.filter(p => p.id !== id);
    return { id };
};