
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, DollarSign, Calendar } from 'lucide-react';

interface KPICardsProps {
  data: any;
}

const KPICards = ({ data }: KPICardsProps) => {
  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const currentPerformance = (parseFloat(data.current_month.accumulated_sales) / parseFloat(data.current_month.goal)) * 100;
  const avgDailySales = parseFloat(data.current_month.accumulated_sales) / parseInt(data.current_month.current_day);

  const kpis = [
    {
      title: 'Ventas Acumuladas',
      value: formatCurrency(data.current_month.accumulated_sales),
      icon: DollarSign,
      badge: currentPerformance >= 100 ? 'Meta Superada' : 'En Progreso',
      badgeVariant: currentPerformance >= 100 ? 'default' : 'secondary',
      trend: `${currentPerformance.toFixed(1)}% de la meta`,
      color: 'text-green-600'
    },
    {
      title: 'Meta Mensual',
      value: formatCurrency(data.current_month.goal),
      icon: Target,
      badge: `Día ${data.current_month.current_day}/${data.current_month.days_in_month}`,
      badgeVariant: 'outline',
      trend: `Proyección: ${formatCurrency(data.current_month.projected_sales)}`,
      color: 'text-blue-600'
    },
    {
      title: 'Promedio Diario',
      value: formatCurrency(avgDailySales),
      icon: TrendingUp,
      badge: 'Actual',
      badgeVariant: 'secondary',
      trend: `Meta diaria: ${formatCurrency(data.current_month.daily_projection)}`,
      color: 'text-purple-600'
    },
    {
      title: 'Días Restantes',
      value: (parseInt(data.current_month.days_in_month) - parseInt(data.current_month.current_day)).toString(),
      icon: Calendar,
      badge: data.current_month.current_day === data.current_month.days_in_month ? 'Mes Completado' : 'Días Hábiles',
      badgeVariant: data.current_month.current_day === data.current_month.days_in_month ? 'default' : 'outline',
      trend: `${((parseInt(data.current_month.current_day) / parseInt(data.current_month.days_in_month)) * 100).toFixed(0)}% del mes transcurrido`,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index} className="shadow-sm border-slate-200 hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon className={`h-8 w-8 ${kpi.color}`} />
                <Badge variant={kpi.badgeVariant as "default" | "secondary" | "destructive" | "outline"} className="text-xs">
                  {kpi.badge}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">{kpi.title}</p>
                <p className="text-2xl font-bold text-slate-900 mb-2">{kpi.value}</p>
                <p className="text-xs text-slate-500">{kpi.trend}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default KPICards;
