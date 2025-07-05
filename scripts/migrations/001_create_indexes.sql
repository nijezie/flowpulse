-- Performance optimization indexes for FlowPulse

-- Flows table indexes
CREATE INDEX IF NOT EXISTS idx_flows_chains_timestamp 
ON flows(chain_from, chain_to, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_flows_coin_timestamp 
ON flows(coin, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_flows_amount_timestamp 
ON flows(amount, timestamp DESC) 
WHERE amount != 0;

-- Composite index for heatmap queries
CREATE INDEX IF NOT EXISTS idx_flows_heatmap 
ON flows(chain_from, chain_to, interval_type, timestamp DESC);

-- Alerts table indexes
CREATE INDEX IF NOT EXISTS idx_alerts_active_chains 
ON alerts(is_active, chain_from, chain_to) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_alerts_triggered 
ON alerts(triggered_at DESC) 
WHERE triggered_at IS NOT NULL;

-- Bets table indexes
CREATE INDEX IF NOT EXISTS idx_bets_chains_status 
ON bets(chain_from, chain_to, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bets_pending_resolution 
ON bets(status, created_at) 
WHERE status = 'pending';

-- Flow aggregates indexes
CREATE INDEX IF NOT EXISTS idx_aggregates_lookup 
ON flow_aggregates(chain_from, chain_to, interval_type, time_bucket DESC);

-- Partial indexes for better performance
CREATE INDEX IF NOT EXISTS idx_flows_recent 
ON flows(timestamp DESC, chain_from, chain_to) 
WHERE timestamp > NOW() - INTERVAL '24 hours';

CREATE INDEX IF NOT EXISTS idx_bets_recent 
ON bets(created_at DESC, user_id) 
WHERE created_at > NOW() - INTERVAL '7 days';
