
import { useState } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BarChart3, TrendingUp } from 'lucide-react';

interface ProjectionChartProps {
  data: any;
  projectionData: any;
}

const ProjectionChart = ({ data, projectionData }: ProjectionChartProps) => {
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Combinar datos reales con proyectados
  const chartData = Object.keys(data.current_month.daily_sales).map((day, index) => {
    const dayNum = parseInt(day);
    const ventasReales = parseFloat(data.current_month.daily_sales[day]);
    const ventasProyectadas = projectionData.projected_sales[index] || 0;
    
    return {
      day: dayNum,
      ventasReales: ventasReales > 0 ? ventasReales : null,
      ventasProyectadas: ventasProyectadas > 0 ? ventasProyectadas : null,
      meta: parseFloat(data.current_month.daily_goals[day]) || 0
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-900">{`Día ${label}`}</p>
          <div className="space-y-1 mt-2">
            {payload.map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color }}>
                <span className={`inline-block w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: entry.color }}></span>
                {entry.name}: {formatCurrency(entry.value || 0)}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const showAlert = projectionData.performance_percentage < 80;

  const renderBarChart = () => (
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
      
      {/* Línea horizontal para la meta diaria promedio */}
      <ReferenceLine 
        y={parseFloat(data.current_month.goal) / parseInt(data.current_month.days_in_month)} 
        stroke="#ef4444" 
        strokeDasharray="5 5"
        label="Meta Diaria Promedio"
      />
      
      <Bar 
        dataKey="ventasReales" 
        fill="#3b82f6"
        name="Ventas Reales"
        radius={[2, 2, 0, 0]}
      />
      <Bar 
        dataKey="ventasProyectadas" 
        fill="#f97316"
        name="Ventas Proyectadas IA"
        radius={[2, 2, 0, 0]}
      />
    </ComposedChart>
  );

  const renderAreaChart = () => (
    <AreaChart
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
      
      {/* Línea horizontal para la meta diaria promedio */}
      <ReferenceLine 
        y={parseFloat(data.current_month.goal) / parseInt(data.current_month.days_in_month)} 
        stroke="#ef4444" 
        strokeDasharray="5 5"
        label="Meta Diaria Promedio"
      />
      
      <Area 
        type="monotone"
        dataKey="ventasReales" 
        stackId="1"
        stroke="#3b82f6"
        fill="#3b82f6"
        fillOpacity={0.6}
        name="Ventas Reales"
      />
      <Area 
        type="monotone"
        dataKey="ventasProyectadas" 
        stackId="2"
        stroke="#f97316"
        fill="#f97316"
        fillOpacity={0.6}
        name="Ventas Proyectadas IA"
      />
    </AreaChart>
  );

  return (
    <div className="space-y-4">
      {showAlert && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Alerta de Rendimiento:</strong> El rendimiento proyectado es del {projectionData.performance_percentage.toFixed(1)}%, 
            por debajo del objetivo del 80%. Se requiere acción inmediata para alcanzar la meta mensual.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Botones de selección de tipo de gráfico */}
      <div className="flex gap-2 justify-center">
        <Button
          variant={chartType === 'bar' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setChartType('bar')}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          {/* Barras */}
        </Button>
        <Button
          variant={chartType === 'area' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setChartType('area')}
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          {/* Área */}
        </Button>
      </div>
      
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? renderBarChart() : renderAreaChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProjectionChart;