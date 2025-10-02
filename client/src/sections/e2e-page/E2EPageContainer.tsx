import { useEffect } from 'react';
import { useE2ERunReport } from '@/hooks';
import E2EPage from '@/sections/e2e-page/E2EPage.tsx';
import { DateTime } from 'luxon';

const E2EPageContainer = () => {
  const {
    data,
    loading,
    error,
    refetch: refetchData,
  } = useE2ERunReport();

  const {
    data: prevData,
    refetch: refetchPrevData,
  } = useE2ERunReport({
    params: {
      date: DateTime.now().minus({ days: 1 }).toUTC().toISODate().slice(0, 10),
      enrichments: {
        includeDetails: false,
      },
    },
  });

  // Poll every 5 seconds when status is pending
  useEffect(() => {
    if (data?.summary.status !== 'pending') {
      return;
    }

    const interval = setInterval(refetchData, 5000);
    return () => clearInterval(interval);
  }, [data?.summary.status, refetchData]);

  const isPageLoading = (loading && !data )|| (data?.summary.status === 'pending');

  const refetch = async () => {
    await refetchData();
    await refetchPrevData();
  };

  return <E2EPage data={data} prevData={prevData} loading={isPageLoading} error={error} refetch={refetch} />;
};

export default E2EPageContainer;
