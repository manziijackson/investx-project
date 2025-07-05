
-- Create a function to process expired investments and return money to user balance
CREATE OR REPLACE FUNCTION public.process_expired_investments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user balances for expired investments that are still active
  UPDATE public.users 
  SET balance = balance + inv.expected_return,
      total_earned = total_earned + (inv.expected_return - inv.amount),
      updated_at = NOW()
  FROM public.user_investments inv
  WHERE users.id = inv.user_id
    AND inv.status = 'active'
    AND inv.end_date <= NOW();

  -- Update the status of expired investments to completed
  UPDATE public.user_investments
  SET status = 'completed'
  WHERE status = 'active'
    AND end_date <= NOW();
    
  -- Log the processing
  RAISE NOTICE 'Processed expired investments at %', NOW();
END;
$$;

-- Create a trigger function that runs whenever we check for expired investments
CREATE OR REPLACE FUNCTION public.check_and_process_expired_investments()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Process expired investments whenever a new investment is created
  -- or when an existing investment is updated
  PERFORM public.process_expired_investments();
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers to automatically process expired investments
DROP TRIGGER IF EXISTS process_expired_investments_on_insert ON public.user_investments;
CREATE TRIGGER process_expired_investments_on_insert
  AFTER INSERT ON public.user_investments
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_process_expired_investments();

DROP TRIGGER IF EXISTS process_expired_investments_on_update ON public.user_investments;
CREATE TRIGGER process_expired_investments_on_update
  AFTER UPDATE ON public.user_investments
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_process_expired_investments();

-- Also create a function that can be called manually or via cron
CREATE OR REPLACE FUNCTION public.manual_process_expired_investments()
RETURNS TABLE (
  processed_count integer,
  total_amount_returned numeric,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_count integer;
  total_returned numeric;
BEGIN
  -- Get count and total before processing
  SELECT COUNT(*), COALESCE(SUM(expected_return), 0)
  INTO expired_count, total_returned
  FROM public.user_investments
  WHERE status = 'active' AND end_date <= NOW();
  
  -- Process the expired investments
  PERFORM public.process_expired_investments();
  
  -- Return results
  RETURN QUERY SELECT 
    expired_count,
    total_returned,
    CASE 
      WHEN expired_count > 0 THEN 
        'Processed ' || expired_count || ' expired investments, returned ' || total_returned || ' RWF to user balances'
      ELSE 
        'No expired investments found'
    END;
END;
$$;
