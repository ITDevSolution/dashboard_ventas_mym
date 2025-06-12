
import { useQuery } from '@tanstack/react-query';

interface SalesDataParams {
  company: string;
  sellerCode: string;
}

const fetchSalesData = async ({ company, sellerCode }: SalesDataParams) => {
  const url = `https://5z4a7ncoo0.execute-api.sa-east-1.amazonaws.com/myDahsboardLambda?company=${company}&seller_code=${sellerCode}`;
  
  console.log('Fetching sales data from:', url);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error fetching sales data: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('Sales data received:', data);
  
  return data;
};

export const useSalesData = (company: string, sellerCode: string) => {
  return useQuery({
    queryKey: ['salesData', company, sellerCode],
    queryFn: () => fetchSalesData({ company, sellerCode }),
    enabled: !!company && !!sellerCode,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
  });
};
