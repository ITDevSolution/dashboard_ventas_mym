
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

const fetchProjectionData = async (
  params: ProjectionRequest
): Promise<ProjectionData> => {
  const url = new URL('https://2a0sw2gqmd.execute-api.sa-east-1.amazonaws.com/default/fnSalesAIECSLambda')

  url.searchParams.append('company', params.company);
  url.searchParams.append('seller_code', params.seller_code);
  
  console.log('Fetching projection data from:', url);
  
  const response = await fetch(url.toString(),{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching projection data: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('Projection data received:', data);
  
  return data;
};

export const useProjectionData = (params: ProjectionRequest) => {
  return useQuery({
    queryKey: ['projectionData', params.company, params.seller_code],
    queryFn: () => fetchProjectionData(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
  });
};