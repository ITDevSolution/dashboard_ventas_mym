import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface DailySalesChartProps {
  data: any;
}

const DailySalesChart = ({ data }: DailySalesChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const chartData = Object.keys(data.current_month.daily_sales).map(day => {
    const ventas = parseFloat(data.current_month.daily_sales[day]);
    const meta = parseFloat(data.current_month.daily_goals[day]);
    const cumpleMeta = ventas >= meta && meta > 0;
    
    return {
      day: parseInt(day),
      ventas: ventas,
      meta: meta,
      cumplimiento: meta > 0 ? (ventas / meta) * 100 : 0,
      cumpleMeta: cumpleMeta,
      ventasCumplio: cumpleMeta ? ventas : 0,
      ventasNoCumplio: !cumpleMeta && meta > 0 ? ventas : 0
    };
  });

    const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const ventasData = payload.find(p => p.dataKey === 'ventasCumplio' || p.dataKey === 'ventasNoCumplio');
      const cumpleMeta = ventasData?.payload?.cumpleMeta || false;
      
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-900">{`Día ${label}`}</p>
          <div className="space-y-1 mt-2">
            <p className={cumpleMeta ? "text-blue-600" : "text-red-600"}>
              <span className={`inline-block w-3 h-3 ${cumpleMeta ? "bg-blue-500" : "bg-red-500"} rounded-full mr-2`}></span>
              Ventas: {formatCurrency(payload.find(p => p.dataKey === 'ventasCumplio' || p.dataKey === 'ventasNoCumplio')?.payload?.ventas || 0)}
            </p>
            <p className="text-green-600">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Meta: {formatCurrency(payload.find(p => p.dataKey === 'meta')?.value || 0)}
            </p>
            <p className="text-purple-600">
              <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
              Cumplimiento: {(payload.find(p => p.dataKey === 'cumplimiento')?.value || 0).toFixed(1)}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomBar = (props: any) => {
    const { payload } = props;
    const color = payload.cumpleMeta ? '#3b82f6' : '#ef4444'; // Azul si cumple meta, rojo si no
    return <Bar {...props} fill={color} />;
  };

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="day" 
            stroke="#64748b"
            fontSize={12}
            tickFormatter={(value) => `${value}`}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Bar 
            dataKey="ventasCumplio" 
            fill="#3b82f6"
            name="Cumplió la meta"
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            dataKey="ventasNoCumplio" 
            fill="#ef4444"
            name="No llegó a la meta"
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            dataKey="meta" 
            fill="#10b981" 
            name="Meta Diaria"
            opacity={0.7}
            radius={[2, 2, 0, 0]}
          />
          <Line 
            type="monotone" 
            dataKey="cumplimiento" 
            stroke="#8b5cf6" 
            strokeWidth={3}
            name="% Cumplimiento"
            dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailySalesChart;