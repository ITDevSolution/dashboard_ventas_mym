
import { useQuery } from '@tanstack/react-query';

interface ProjectionRequest {
  company: string;
  seller_code: string;
}

interface ProjectionData {
  accumulated_sales: number;
  projected_sales: number[];
  total_projected: number;
  goal: number;
  performance_percentage: number;
  projection_date: string;
}

const fetchProjectionData = async (company: string, sellerCode: string): Promise<ProjectionData> => {
  const url = `https://2a0sw2gqmd.execute-api.sa-east-1.amazonaws.com/default/fnSalesAIECSLambda?company=${company}&seller_code=${sellerCode}`;

  console.log('Fetching projection data from AWS API:', url);
  
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error fetching projection data: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('Projection data received:', data);
  
  return data;
};

export const useProjectionData = (company: string, sellerCode: string) => {
  return useQuery({
    queryKey: ['projectionData', company, sellerCode],
    queryFn: () => fetchProjectionData(company, sellerCode),
    enabled: !!company && !!sellerCode,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
  });
};