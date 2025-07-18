
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import DailySalesChart from './DailySalesChart';
import ProjectionChart from './ProjectionChart';
import KPICards from './KPICards';
import { TrendingUp, TrendingDown, Calendar, FileText, Loader2, AlertCircle, Brain, Clock, Target, Activity } from 'lucide-react';
import { useSalesData } from '@/hooks/useSalesData';
import { useProjectionData } from '@/hooks/useProjectionData';
import { useSearchParams } from 'react-router-dom';

const SalesDashboard = () => {
  const [searchParams] = useSearchParams();
  const company = searchParams.get('company') || '10';
  const sellerCode = searchParams.get('seller_code') || '000070';

  console.log('URL Parameters:', { company, sellerCode });

  const { data, isLoading, error } = useSalesData(company, sellerCode);
  const { data: projectionData, isLoading: projectionLoading, error: projectionError } = useProjectionData(company, sellerCode);

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

    // Calcular datos semanales reales basados en la API
  const calculateWeeklyData = () => {
    const dailyGoals = data.current_month.daily_goals;
    const dailySales = data.current_month.daily_sales;
    
    // Obtener todas las metas únicas para determinar las metas de lunes-viernes y sábados
    const goalValues = Object.values(dailyGoals)
      .map(goal => parseFloat(String(goal)))
      .filter(goal => goal > 0);
    
    // Ordenar para obtener las dos metas diferentes
    const uniqueGoals = [...new Set(goalValues)].sort((a, b) => b - a);
    
    const mondayToFridayGoal = uniqueGoals[0] || 0; // Meta más alta (lunes-viernes)
    const saturdayGoal = uniqueGoals[1] || 0; // Meta más baja (sábados)
    
    // Calcular promedio de ventas de días con datos
    const salesWithData = Object.entries(dailySales)
      .filter(([day, sales]) => parseFloat(String(sales)) > 0)
      .map(([day, sales]) => parseFloat(String(sales)));
    
    const averageDailySales = salesWithData.length > 0 ? 
      salesWithData.reduce((sum, sale) => sum + sale, 0) / salesWithData.length : 0;
    
    // Encontrar el mejor día (solo si hay más de 3 ventas para que sea significativo)
    let bestDay = "N/A";
    let bestDayAmount = 0;
    
    if (salesWithData.length > 3) {
      const bestSale = Math.max(...salesWithData);
      const bestDayEntry = Object.entries(dailySales).find(([day, sales]) => parseFloat(String(sales)) === bestSale);
      if (bestDayEntry) {
        const dayNumber = parseInt(bestDayEntry[0]);
        bestDay = `Día ${dayNumber}`;
        bestDayAmount = bestSale;
      }
    }

    return {
      mondayToFriday: {
        goal: mondayToFridayGoal,
        averageDailySales: averageDailySales,
        totalDays: salesWithData.length,
        bestDay: bestDay,
        bestDayAmount: bestDayAmount
      },
      saturdayGoal: saturdayGoal
    };
  };

   // Datos estáticos para ventas por días de la semana
  const weeklyData = calculateWeeklyData();

  const currentPerformance = (parseFloat(data.current_month.accumulated_sales) / parseFloat(data.current_month.goal)) * 100;
  const previousPerformance = parseFloat(data.previous_month.performance_percentage);
  const growthRate = ((parseFloat(data.current_month.accumulated_sales) - parseFloat(data.previous_month.sales)) / parseFloat(data.previous_month.sales)) * 100;

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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

        {/* AI Projection and Weekly Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Projection Card */}
          <Card className="shadow-sm border-slate-200 bg-gradient-to-br from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Proyección IA de Ventas
                {!projectionLoading && !projectionError && (
                  <Badge variant="default" className="ml-auto text-xs bg-green-100 text-green-700">
                    Activo
                  </Badge>
                )}
                {projectionLoading && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Cargando...
                  </Badge>
                )}
                {projectionError && (
                  <Badge variant="destructive" className="ml-auto text-xs">
                    Error
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {projectionLoading ? (
                <div className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-600" />
                  <p className="text-sm text-slate-600 mt-2">Cargando proyección IA...</p>
                </div>
              ) : projectionError ? (
                <div className="text-center py-4">
                  <AlertCircle className="h-6 w-6 mx-auto text-red-500" />
                  <p className="text-sm text-slate-600 mt-2">Error al cargar proyección</p>
                </div>
              ) : projectionData ? (
                <>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-700">{formatCurrency(projectionData.total_projected)}</p>
                    <p className="text-sm text-slate-600">Proyección Total IA</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Activity className="h-4 w-4 text-green-600" />
                        <p className="text-2xl font-bold text-green-600">{projectionData.performance_percentage.toFixed(1)}%</p>
                      </div>
                      <p className="text-xs text-slate-600">Rendimiento Proyectado</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Target className="h-4 w-4 text-blue-600" />
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(projectionData.goal)}</p>
                      </div>
                      <p className="text-xs text-slate-600">Meta Mensual</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 mt-4">
                    <p className="text-sm font-medium text-slate-700 mb-1">Última Actualización:</p>
                    <p className="text-sm text-slate-600 italic">
                      {new Date(projectionData.projection_date).toLocaleString('es-PE')}
                    </p>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          {/* Weekly Sales Analysis */}
          <Card className="shadow-sm border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Análisis Semanal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Meta Lunes - Viernes</span>
                  <span className="text-lg font-bold text-green-700">{formatCurrency(weeklyData.mondayToFriday.goal)}</span>
                </div>
                <p className="text-xs text-slate-500">Meta diaria días laborables</p>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Meta Sábados</span>
                  <span className="text-lg font-bold text-blue-700">{formatCurrency(weeklyData.saturdayGoal)}</span>
                </div>
                <p className="text-xs text-slate-500">Meta diaria sábados</p>
              </div>

              {weeklyData.mondayToFriday.totalDays > 0 && (
                <>
                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-600">Promedio Actual</span>
                      <span className="text-lg font-bold text-slate-700">{formatCurrency(weeklyData.mondayToFriday.averageDailySales)}</span>
                    </div>
                    <p className="text-xs text-slate-500">Basado en {weeklyData.mondayToFriday.totalDays} día(s) con ventas</p>
                  </div>

                  {weeklyData.mondayToFriday.bestDay !== "N/A" && (
                    <div className="bg-white rounded-lg p-3 mt-4">
                      <p className="text-sm font-medium text-slate-700 mb-1">Mejor día hasta ahora:</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600">{weeklyData.mondayToFriday.bestDay}</span>
                        <span className="text-sm font-bold text-green-700">{formatCurrency(weeklyData.mondayToFriday.bestDayAmount)}</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {weeklyData.mondayToFriday.totalDays === 0 && (
                <div className="bg-yellow-50 rounded-lg p-3 mt-4">
                  <p className="text-sm text-yellow-800">
                    No hay datos de ventas suficientes para calcular promedios semanales.
                  </p>
                </div>
              )}

              {weeklyData.mondayToFriday.totalDays > 0 && weeklyData.mondayToFriday.totalDays <= 3 && (
                <div className="bg-blue-50 rounded-lg p-3 mt-4">
                  <p className="text-sm text-blue-800">
                    Datos insuficientes para mostrar el mejor día (se requieren más de 3 días con ventas).
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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

        {/* Projection Chart */}
        {projectionData && (
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle>Gráfico Comparativo: Ventas Reales vs Proyección IA</CardTitle>
              <p className="text-sm text-slate-600">
                Comparación de ventas reales con las proyecciones generadas por IA
              </p>
            </CardHeader>
            <CardContent>
              <ProjectionChart data={data} projectionData={projectionData} />
            </CardContent>
          </Card>
        )}

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
      </div>
    </div>
  );
};

export default SalesDashboard;
