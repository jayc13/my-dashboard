import { useEffect, useMemo } from 'react';
import { useE2ERunReport } from '@/hooks';
import E2EPage from '@/sections/e2e-page/E2EPage.tsx';
import { DateTime } from 'luxon';

const E2EPageContainer = () => {
  const { data, loading, error, refetch: refetchData } = useE2ERunReport();

  // Memoize the params object to prevent infinite re-renders
  const prevDayParams = useMemo(
    () => ({
      date: DateTime.now().minus({ days: 1 }).toUTC().toISODate().slice(0, 10),
      enrichments: {
        includeDetails: false,
      },
    }),
    [],
  ); // Empty deps array since we want yesterday's date calculated once

  const { data: prevData, refetch: refetchPrevData } = useE2ERunReport({
    params: prevDayParams,
  });

  // Poll every 5 seconds when status is pending
  useEffect(() => {
    if (data?.summary.status !== 'pending') {
      return;
    }

    const interval = setInterval(() => refetchData(), 5000);
    return () => clearInterval(interval);
  }, [data?.summary.status, refetchData]);

  const refetch = async (force?: boolean) => {
    await refetchData(force);
    await refetchPrevData(force);
  };

  return (
    <E2EPage data={data} prevData={prevData} loading={loading} error={error} refetch={refetch} />
  );
};

export default E2EPageContainer;
