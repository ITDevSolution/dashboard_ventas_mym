
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
  const url = 'http://54.232.3.164/project-sales';
  
  console.log('Fetching projection data from:', url);
  
  const response = await fetch(url,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params)
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
    queryKey: ['projectionData', params],
    queryFn: () => fetchProjectionData(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
  });
};