
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import DailySalesChart from './DailySalesChart';
import KPICards from './KPICards';
import { TrendingUp, TrendingDown, Calendar, FileText, Loader2, AlertCircle } from 'lucide-react';
import { useSalesData } from '@/hooks/useSalesData';
import { useSearchParams } from 'react-router-dom';

const SalesDashboard = () => {
  const [searchParams] = useSearchParams();
  const company = searchParams.get('company') || '10';
  const sellerCode = searchParams.get('seller_code') || '000070';

  console.log('URL Parameters:', { company, sellerCode });

  const { data, isLoading, error } = useSalesData(company, sellerCode);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-lg">Cargando datos de ventas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Error al cargar datos</h2>
            <p className="text-slate-600 mb-4">
              No se pudieron obtener los datos de ventas para la empresa {company} y vendedor {sellerCode}.
            </p>
            <p className="text-sm text-slate-500">
              Error: {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const currentPerformance = (parseFloat(data.current_month.accumulated_sales) / parseFloat(data.current_month.goal)) * 100;
  const previousPerformance = parseFloat(data.previous_month.performance_percentage);
  const growthRate = ((parseFloat(data.current_month.accumulated_sales) - parseFloat(data.previous_month.sales)) / parseFloat(data.previous_month.sales)) * 100;

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">{data.seller_info.company_name_short} Dashboard</h1>
              <p className="text-slate-600 text-lg mt-1">{data.seller_info.company_name_large.trim()}</p>
              <p className="text-slate-800 font-bold text-2xl">{data.seller_info.seller_name}</p>
              {/* <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  Empresa: {company}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Vendedor: {sellerCode}
                </Badge>
              </div> */}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">{data.seller_info.month_name}</p>
                <p className="text-sm text-slate-600">{data.seller_info.year}</p>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <KPICards data={data} />

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Rendimiento del Mes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Meta Mensual</span>
                  <span className="font-medium">{formatCurrency(data.current_month.goal)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Ventas Acumuladas</span>
                  <span className="font-medium">{formatCurrency(data.current_month.accumulated_sales)}</span>
                </div>
                <Progress value={currentPerformance} className="h-3" />
                <p className="text-sm text-center mt-2">
                  <span className={`font-bold ${currentPerformance >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                    {currentPerformance.toFixed(1)}%
                  </span> de la meta alcanzada
                </p>
              </div>
              
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Crecimiento vs mes anterior</span>
                  <div className="flex items-center gap-1">
                    {growthRate >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`font-bold ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Cotizaciones Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900">{data.pending_quotes.count}</p>
                  <p className="text-sm text-slate-600">Cotizaciones</p>
                </div>
                <div className="text-center pt-4 border-t border-slate-200">
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(data.pending_quotes.total_amount)}</p>
                  <p className="text-sm text-slate-600">Valor Total Potencial</p>
                </div>
                <Badge variant="outline" className="w-full justify-center">
                  Período: {data.pending_quotes.date}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Sales Chart */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Ventas Diarias vs Meta</CardTitle>
            <p className="text-sm text-slate-600">
              Comparación de ventas diarias con metas establecidas
            </p>
          </CardHeader>
          <CardContent>
            <DailySalesChart data={data} />
          </CardContent>
        </Card>

        {/* Previous Month Comparison */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Comparación Mes Anterior</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-slate-600">Ventas Mes Anterior</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(data.previous_month.sales)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600">Meta Mes Anterior</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(data.previous_month.goal)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600">Rendimiento</p>
                <p className={`text-2xl font-bold ${previousPerformance >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
                  {previousPerformance}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* URL Parameters Help */}
        {/* <Card className="shadow-sm border-slate-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 URL Dinámica:</strong> Cambia los parámetros en la URL para ver otros vendedores.
              <br />
              Ejemplo: <code className="bg-blue-200 px-1 rounded">?company=10&seller_code=000070</code>
            </p>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
};

export default SalesDashboard;
