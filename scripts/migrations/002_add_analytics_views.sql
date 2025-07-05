-- Analytics views for FlowPulse dashboard

-- View for real-time flow summary
CREATE OR REPLACE VIEW v_flow_summary AS
SELECT 
  chain_from,
  chain_to,
  coin,
  interval_type,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount,
  MAX(amount) as max_amount,
  MIN(amount) as min_amount,
  MAX(timestamp) as latest_timestamp,
  CASE 
    WHEN SUM(amount) > 0 THEN 'inflow'
    WHEN SUM(amount) < 0 THEN 'outflow'
    ELSE 'neutral'
  END as flow_direction
FROM flows 
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY chain_from, chain_to, coin, interval_type;

-- View for chain activity ranking
CREATE OR REPLACE VIEW v_chain_activity AS
SELECT 
  chain_name,
  total_volume,
  inflow_volume,
  outflow_volume,
  net_volume,
  transaction_count,
  active_pairs
FROM (
  SELECT 
    chain_from as chain_name,
    SUM(ABS(amount)) as total_volume,
    SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as inflow_volume,
    SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as outflow_volume,
    SUM(amount) as net_volume,
    COUNT(*) as transaction_count,
    COUNT(DISTINCT chain_to) as active_pairs
  FROM flows 
  WHERE timestamp > NOW() - INTERVAL '24 hours'
  GROUP BY chain_from
  
  UNION ALL
  
  SELECT 
    chain_to as chain_name,
    SUM(ABS(amount)) as total_volume,
    SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as inflow_volume,
    SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as outflow_volume,
    -SUM(amount) as net_volume,
    COUNT(*) as transaction_count,
    COUNT(DISTINCT chain_from) as active_pairs
  FROM flows 
  WHERE timestamp > NOW() - INTERVAL '24 hours'
  GROUP BY chain_to
) combined
GROUP BY chain_name, total_volume, inflow_volume, outflow_volume, net_volume, transaction_count, active_pairs
ORDER BY total_volume DESC;

-- View for betting statistics
CREATE OR REPLACE VIEW v_betting_stats AS
SELECT 
  chain_from,
  chain_to,
  direction,
  COUNT(*) as total_bets,
  SUM(amount) as total_wagered,
  AVG(odds) as avg_odds,
  COUNT(CASE WHEN status = 'won' THEN 1 END) as wins,
  COUNT(CASE WHEN status = 'lost' THEN 1 END) as losses,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  ROUND(
    COUNT(CASE WHEN status = 'won' THEN 1 END)::DECIMAL / 
    NULLIF(COUNT(CASE WHEN status IN ('won', 'lost') THEN 1 END), 0) * 100, 
    2
  ) as win_rate_percent
FROM bets 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY chain_from, chain_to, direction
ORDER BY total_wagered DESC;

-- View for alert effectiveness
CREATE OR REPLACE VIEW v_alert_effectiveness AS
SELECT 
  a.id,
  a.chain_from,
  a.chain_to,
  a.alert_type,
  a.threshold_amount,
  a.trigger_count,
  a.created_at,
  COALESCE(recent_flows.flow_count, 0) as recent_flow_count,
  COALESCE(recent_flows.avg_amount, 0) as recent_avg_amount,
  CASE 
    WHEN a.trigger_count > 0 THEN 'active'
    WHEN recent_flows.flow_count > 0 THEN 'monitoring'
    ELSE 'quiet'
  END as status
FROM alerts a
LEFT JOIN (
  SELECT 
    chain_from,
    chain_to,
    COUNT(*) as flow_count,
    AVG(amount) as avg_amount
  FROM flows 
  WHERE timestamp > NOW() - INTERVAL '24 hours'
  GROUP BY chain_from, chain_to
) recent_flows ON a.chain_from = recent_flows.chain_from 
                AND a.chain_to = recent_flows.chain_to
WHERE a.is_active = true;
