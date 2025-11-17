

import React from 'react';
import { useMemo, useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { ICONS } from '../constants';
import { PaymentStatus, PaymentOrigin, Payment, Process } from '../types';
import { useGetAllPayments } from '../hooks/api/payments/useGetAllPayments';
import { useGetAllProcesses } from '../hooks/api/processes/useGetAllProcesses';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Button } from '../components/ui/Button';

const ChartCard: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm h-[400px] flex flex-col">
        <div className="flex items-center gap-2 mb-4">
            {icon}
            <h2 className="text-lg font-bold text-brand-gray-800">{title}</h2>
        </div>
        <div className="flex-grow text-sm">
            {children}
        </div>
    </div>
);

const ChartSkeleton = () => (
    <div className="bg-white p-5 rounded-xl shadow-sm h-[400px] flex flex-col animate-pulse">
        <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded bg-brand-gray-200"></div>
            <div className="h-6 w-48 rounded bg-brand-gray-200"></div>
        </div>
        <div className="flex-grow bg-brand-gray-100 rounded-lg"></div>
    </div>
);

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatCurrencyShort = (value: number) => {
    if (value >= 1000000) return `R$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `R$${(value / 1000).toFixed(0)}k`;
    return `R$${value}`;
}

const countDataKeys = ['Processos Abertos', 'Pagamentos Efetuados', 'Pagos', 'Vencidos'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const isPaymentBarChart = payload.some((p: any) => p.dataKey === 'Acordo' || p.dataKey === 'Execução');

    if (isPaymentBarChart) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-brand-gray-200">
            <p className="font-bold text-brand-gray-800 mb-2 text-center text-sm">{label}</p>
            <div className="space-y-1">
                {payload.map((pld: any, index: number) => (
                    <div key={index} className="flex items-center text-sm">
                        <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: pld.fill }}></div>
                        <span className="text-brand-gray-600 mr-2">{`${pld.name}:`}</span>
                        <span className="font-semibold text-brand-gray-800">{formatCurrency(pld.value)}</span>
                    </div>
                ))}
            </div>
        </div>
      );
    }
    
    // Generic tooltip for other charts
    return (
      <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-brand-gray-200">
        <p className="font-bold text-brand-gray-800 mb-2">{label}</p>
        {payload.map((pld: any, index: number) => (
          <div key={index} className="flex items-center text-sm">
            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: pld.color }}></div>
            <span className="text-brand-gray-600 mr-2">{`${pld.name}:`}</span>
            <span className="font-semibold text-brand-gray-800">{ countDataKeys.includes(pld.name) ? pld.value : formatCurrency(pld.value) }</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};


const CustomChartLegend = (props: any) => {
    const { payload } = props;
    return (
        <div className="flex justify-center items-center gap-6 pt-4">
            {payload?.map((entry: any, index: number) => (
                <div key={`item-${index}`} className="flex items-center gap-2 text-sm text-brand-gray-600">
                    <svg width="24" height="12" viewBox="0 0 24 12" className="flex-shrink-0">
                       <line 
                         x1="0" y1="6" x2="24" y2="6" 
                         stroke={entry.color} 
                         strokeWidth="2.5" 
                         strokeDasharray={entry.payload?.strokeDasharray || '0'}
                       />
                    </svg>
                    <span>{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

const PieChartWithSummary: React.FC<{ data: {name: string, value: number}[], colors: string[], title: string, icon: React.ReactNode }> = ({data, colors, title, icon}) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    return (
         <ChartCard title={title} icon={icon}>
            <div className="grid grid-cols-2 h-full">
                <div className="flex flex-col justify-center gap-4">
                    {data.map((entry, index) => (
                        <div key={index} className="flex items-center">
                            <div style={{backgroundColor: colors[index % colors.length]}} className="w-3 h-3 rounded-full mr-3 shrink-0"></div>
                            <div>
                                <p className="text-brand-gray-500 text-sm">{entry.name}</p>
                                <p className="font-bold text-brand-gray-800 text-lg">{formatCurrency(entry.value)}</p>
                                <p className="text-brand-gray-500 font-medium text-xs">{`${total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0}% do total`}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="relative w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                innerRadius={'65%'}
                                outerRadius={'90%'}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '0.5rem', borderColor: '#e2e8f0' }} />
                            <text x="50%" y="50%" dy={-8} textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-brand-gray-800">
                                {formatCurrencyShort(total)}
                            </text>
                            <text x="50%" y="50%" dy={14} textAnchor="middle" dominantBaseline="middle" className="text-sm fill-brand-gray-500">
                                Total
                            </text>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </ChartCard>
    );
}

interface FilterButtonProps {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}
const FilterButton: React.FC<FilterButtonProps> = ({ onClick, isActive, children }) => (
  <Button variant={isActive ? 'primary' : 'outline'} size="sm" onClick={onClick} className="!font-semibold">
    {children}
  </Button>
);

const originFilterOptions: { label: string; value: 'all' | PaymentOrigin }[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Trade', value: PaymentOrigin.Trade },
    { label: 'Talento', value: PaymentOrigin.Talento },
]

const Dashboard: React.FC = () => {
  const { data: processes = [], isLoading: isLoadingProcesses } = useGetAllProcesses();
  const { data: payments = [], isLoading: isLoadingPayments } = useGetAllPayments();
  const isLoading = isLoadingProcesses || isLoadingPayments;
  
  const [originFilter, setOriginFilter] = useState<'all' | PaymentOrigin>('all');
  
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    processes.forEach(p => years.add(new Date(p.distributionDate).getFullYear()));
    payments.forEach(p => years.add(new Date(p.dueDate).getFullYear()));
    return Array.from(years).sort((a, b) => b - a); // Descending order
  }, [processes, payments]);

  const [yearFilter, setYearFilter] = useState<number | 'all'>(availableYears[0] || new Date().getFullYear());

  useEffect(() => {
    if (availableYears.length > 0 && yearFilter === 'all') {
      setYearFilter(availableYears[0]);
    }
  }, [availableYears, yearFilter]);

  const filteredPayments = useMemo(() => {
    let filtered: Payment[] = [...payments];

    if (yearFilter !== 'all') {
      filtered = filtered.filter(p => new Date(p.dueDate).getFullYear() === yearFilter);
    }

    if (originFilter !== 'all') {
      filtered = filtered.filter(p => p.origin === originFilter);
    }

    return filtered;
  }, [payments, originFilter, yearFilter]);

  const filteredProcesses = useMemo(() => {
    let filtered: Process[] = [...processes];

    if (yearFilter !== 'all') {
      filtered = filtered.filter(p => new Date(p.distributionDate).getFullYear() === yearFilter);
    }

    if (originFilter !== 'all') {
      filtered = filtered.filter(p => p.origin === originFilter);
    }

    return filtered;
  }, [processes, originFilter, yearFilter]);


    const {
        totalPaidValue,
        totalPendingValue,
        pendingPaymentsCount,
        overduePaymentsCount,
        totalPaymentsCount
    } = useMemo(() => {
        let paid = 0;
        let pending = 0;
        let pendingCount = 0;
        let overdueCount = 0;
        
        filteredPayments.forEach(p => {
            if (p.status === PaymentStatus.Paid) {
                paid += p.value;
            }
            if (p.status === PaymentStatus.Pending || p.status === PaymentStatus.Overdue) {
                pending += p.value;
                pendingCount++;
            }
            if (p.isOverdue) {
                 overdueCount++;
            }
        });

        return {
            totalPaidValue: paid,
            totalPendingValue: pending,
            pendingPaymentsCount: pendingCount,
            overduePaymentsCount: overdueCount,
            totalPaymentsCount: filteredPayments.length
        };
    }, [filteredPayments]);
  
  const getFilterDescription = () => {
    const yearLabel = yearFilter === 'all' ? 'de todo o período' : `para o ano de ${yearFilter}`;
    const originLabel = originFilterOptions.find(o => o.value === originFilter)?.label;
    let description = `Visão geral dos pagamentos`;
    const details = [yearLabel];
    if(originLabel !== 'Todos') details.push(`de origem ${originLabel}`);

    if(details.length > 0) return `${description} (${details.join(' e ')})`
    return description;
  }

    const monthlyPaymentsData = useMemo(() => {
        if (yearFilter === 'all') return [];

        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const monthlyData: { [key: number]: { 'Acordo': number; 'Execução': number } } = {};
        for (let i = 0; i < 12; i++) {
            monthlyData[i] = { 'Acordo': 0, 'Execução': 0 };
        }

        filteredPayments.forEach(p => {
            const date = new Date(p.dueDate);
            const monthIndex = date.getMonth();
            if (monthlyData[monthIndex] && (p.type === 'Acordo' || p.type === 'Execução')) {
                monthlyData[monthIndex][p.type as 'Acordo' | 'Execução'] += p.value;
            }
        });
        
        return months.map((name, index) => ({ name, ...monthlyData[index] }));
    }, [filteredPayments, yearFilter]);

    const processPaymentFlowData = useMemo(() => {
        if (yearFilter === 'all') return [];

        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const monthlyData: { [key: number]: { "Processos Abertos": number; "Pagamentos Efetuados": number } } = {};
        for (let i = 0; i < 12; i++) {
            monthlyData[i] = { "Processos Abertos": 0, "Pagamentos Efetuados": 0 };
        }

        filteredProcesses.forEach(p => {
            const date = new Date(p.distributionDate);
            const monthIndex = date.getMonth();
            if (monthlyData[monthIndex]) {
                monthlyData[monthIndex]["Processos Abertos"]++;
            }
        });

        filteredPayments.forEach(p => {
            if (p.status === PaymentStatus.Paid && p.paymentDate) {
                const paymentDate = new Date(p.paymentDate);
                const monthIndex = paymentDate.getMonth();
                if (monthlyData[monthIndex]) {
                    monthlyData[monthIndex]["Pagamentos Efetuados"]++;
                }
            }
        });
        
        return months.map((name, index) => ({ name, ...monthlyData[index] }));
    }, [filteredProcesses, filteredPayments, yearFilter]);


    const paymentTypeData = useMemo(() => {
        const totals = filteredPayments.reduce((acc, p) => {
            if(p.type === 'Acordo' || p.type === 'Execução') {
                acc[p.type] = (acc[p.type] || 0) + p.value;
            }
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(totals).map(([name, value]) => ({ name, value }));
    }, [filteredPayments]);

    const paymentOriginData = useMemo(() => {
        const totals = filteredPayments.reduce((acc, p) => {
            acc[p.origin] = (acc[p.origin] || 0) + p.value;
            return acc;
        }, {} as Record<PaymentOrigin, number>);
        return Object.entries(totals).map(([name, value]) => ({ name, value }));
    }, [filteredPayments]);

    const COLORS_TYPE = ['#2563eb', '#16a34a'];
    const COLORS_ORIGIN = ['#4f46e5', '#db2777'];


  return (
    <div>
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-brand-gray-900">Dashboard Executivo</h1>
            <p className="text-brand-gray-500 mt-1">{getFilterDescription()}</p>
        </div>
        
         <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-8">
            <div className="flex items-center gap-3">
                <label htmlFor="year-filter" className="text-sm font-semibold text-brand-gray-600">Ano:</label>
                <select
                    id="year-filter"
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="px-3 py-1.5 text-sm font-semibold text-brand-gray-700 bg-white border border-brand-gray-300 rounded-md shadow-sm hover:bg-brand-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500"
                    aria-label="Filtrar por ano"
                >
                    <option value="all">Todos</option>
                    {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>
             <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-brand-gray-600">Origem:</p>
                <div className="flex items-center gap-2">
                     {originFilterOptions.map(({label, value}) => (
                        <FilterButton key={value} onClick={() => setOriginFilter(value)} isActive={originFilter === value}>
                            {label}
                        </Button>
                    ))}
                </div>
            </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Pago" value={isLoading ? '...' : formatCurrency(totalPaidValue)} subtext="Pagamentos concluídos" icon={<ICONS.CheckCircle />} iconBgColor="bg-green-100" iconColor="text-green-600" trendIcon={<ICONS.UpRightArrow />} to="/payments" />
        <StatCard title="Valor Pendente" value={isLoading ? '...' : formatCurrency(totalPendingValue)} subtext="Aguardando pagamento" icon={<ICONS.Payments />} iconBgColor="bg-purple-100" iconColor="text-purple-600" trendIcon={<ICONS.UpRightArrow />} to="/payments" />
        <StatCard title="Total de Pagamentos" value={isLoading ? '...' : totalPaymentsCount.toString()} subtext="Pagamentos no período" icon={<ICONS.Hashtag />} iconBgColor="bg-blue-100" iconColor="text-blue-600" trendIcon={<ICONS.UpRightArrow />} />
        <StatCard title="Pagamentos Pendentes" value={isLoading ? '...' : pendingPaymentsCount.toString()} subtext={`${overduePaymentsCount} em atraso`} icon={<ICONS.PendingPayments />} iconBgColor="bg-orange-100" iconColor="text-orange-600" trendIcon={<ICONS.UpRightArrow />} trendIconColor='text-orange-500' to="/payments" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
            Array.from({length: 4}).map((_, i) => <ChartSkeleton key={i} />)
        ) : (
            <>
                <ChartCard title="Pagamentos por Mês" icon={<ICONS.Payments className="w-6 h-6 text-brand-blue-700"/>}>
                    <div className="relative w-full h-full">
                        {yearFilter !== 'all' ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyPaymentsData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrencyShort} />
                                    <Tooltip cursor={{fill: 'rgba(241, 245, 249, 0.6)'}} content={CustomTooltip} />
                                    <Legend wrapperStyle={{fontSize: "14px", paddingTop: "10px"}}/>
                                    <Bar dataKey="Acordo" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Execução" fill="#16a34a" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-center text-brand-gray-500 p-4">
                                <p>Selecione um ano para visualizar o gráfico de pagamentos mensais.</p>
                            </div>
                        )}
                    </div>
                </ChartCard>

                <PieChartWithSummary
                    data={paymentTypeData}
                    colors={COLORS_TYPE}
                    title="Distribuição por Tipo de Pagamento"
                    icon={<ICONS.JurisControlLogo className="w-6 h-6 text-brand-blue-700"/>}
                />

                <ChartCard title="Fluxo de Processos vs. Pagamentos" icon={<ICONS.Calendar className="w-6 h-6 text-brand-blue-700"/>}>
                    <div className="relative w-full h-full">
                        {yearFilter !== 'all' ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={processPaymentFlowData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} domain={[0, (dataMax: number) => Math.max(dataMax + 1, 5)]}/>
                                    <Tooltip content={CustomTooltip}/>
                                    <Legend verticalAlign="bottom" content={CustomChartLegend} />
                                    <Line type="monotone" dataKey="Processos Abertos" name="Processos Abertos" stroke="#f97316" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ r: 4, stroke: 'white', strokeWidth: 2 }}/>
                                    <Line type="monotone" dataKey="Pagamentos Efetuados" name="Pagamentos Efetuados" stroke="#16a34a" strokeWidth={2.5} strokeDasharray="5 5" activeDot={{ r: 6 }} dot={{ r: 4, stroke: 'white', strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                         ) : (
                            <div className="flex items-center justify-center h-full text-center text-brand-gray-500 p-4">
                                <p>Selecione um ano para visualizar o fluxo mensal de processos e pagamentos.</p>
                            </div>
                        )}
                    </div>
                </ChartCard>
                
                <PieChartWithSummary
                    data={paymentOriginData}
                    colors={COLORS_ORIGIN}
                    title="Distribuição por Origem de Pagamento"
                    icon={<ICONS.ActiveProcesses className="w-6 h-6 text-brand-blue-700"/>}
                />
            </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;