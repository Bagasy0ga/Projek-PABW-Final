import supabase from "../config/db.js";

/**
 * Supabase Query Helper Functions
 * Abstraction layer untuk queries ke Supabase
 */

// ============================================
// SELECT Operations
// ============================================

export async function select(table, options = {}) {
  let query = supabase.from(table).select(options.select || "*");

  // WHERE conditions
  if (options.where) {
    for (const [key, value] of Object.entries(options.where)) {
      if (Array.isArray(value)) {
        query = query.in(key, value);
      } else if (value === null) {
        query = query.is(key, null);
      } else {
        query = query.eq(key, value);
      }
    }
  }

  // OR conditions
  if (options.or) {
    query = query.or(options.or);
  }

  // LIKE/ILIKE search
  if (options.search) {
    const { field, value, caseSensitive = false } = options.search;
    if (caseSensitive) {
      query = query.like(field, `%${value}%`);
    } else {
      query = query.ilike(field, `%${value}%`);
    }
  }

  // Greater than / Less than
  if (options.gt) {
    for (const [key, value] of Object.entries(options.gt)) {
      query = query.gt(key, value);
    }
  }

  if (options.lt) {
    for (const [key, value] of Object.entries(options.lt)) {
      query = query.lt(key, value);
    }
  }

  if (options.gte) {
    for (const [key, value] of Object.entries(options.gte)) {
      query = query.gte(key, value);
    }
  }

  if (options.lte) {
    for (const [key, value] of Object.entries(options.lte)) {
      query = query.lte(key, value);
    }
  }

  // ORDERING
  if (options.order) {
    const { column, ascending = true } = options.order;
    query = query.order(column, { ascending });
  }

  // PAGINATION
  if (options.limit) {
    const limit = parseInt(options.limit);
    const offset = parseInt(options.offset) || 0;
    query = query.range(offset, offset + limit - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function selectOne(table, where) {
  const data = await select(table, { where, limit: 1 });
  return data && data.length > 0 ? data[0] : null;
}

export async function count(table, where = {}) {
  let query = supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (where) {
    for (const [key, value] of Object.entries(where)) {
      query = query.eq(key, value);
    }
  }

  const { count: total, error } = await query;
  if (error) throw error;
  return total;
}

// ============================================
// INSERT Operations
// ============================================

export async function insert(table, data) {
  const { data: result, error } = await supabase
    .from(table)
    .insert([data])
    .select();

  if (error) throw error;
  return result;
}

export async function insertMany(table, dataArray) {
  const { data: result, error } = await supabase
    .from(table)
    .insert(dataArray)
    .select();

  if (error) throw error;
  return result;
}

// ============================================
// UPDATE Operations
// ============================================

export async function update(table, data, where) {
  let query = supabase.from(table).update(data);

  for (const [key, value] of Object.entries(where)) {
    query = query.eq(key, value);
  }

  const { data: result, error } = await query.select();
  if (error) throw error;
  return result;
}

// ============================================
// DELETE Operations
// ============================================

export async function deleteRecord(table, where) {
  let query = supabase.from(table).delete();

  for (const [key, value] of Object.entries(where)) {
    query = query.eq(key, value);
  }

  const { error } = await query;
  if (error) throw error;
  return { success: true };
}

// ============================================
// JOINS & ADVANCED QUERIES
// ============================================

/**
 * Helper untuk SELECT dengan JOIN
 * Gunakan RPC untuk query kompleks, atau gunakan ini untuk simple joins
 */
export async function selectWithJoin(
  mainTable,
  joins = [],
  options = {}
) {
  let selectStr = options.select || "*";

  // Untuk simple joins, kita bisa compose query
  // Tapi untuk complex joins, sebaiknya gunakan RPC function di Supabase
  let query = supabase.from(mainTable).select(selectStr);

  if (options.where) {
    for (const [key, value] of Object.entries(options.where)) {
      query = query.eq(key, value);
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Helper untuk memanggil RPC function (stored procedure di Supabase)
 * Gunakan untuk query kompleks dengan JOINs, GROUP BY, aggregations
 */
export async function callRpc(functionName, params = {}) {
  const { data, error } = await supabase.rpc(functionName, params);

  if (error) throw error;
  return data;
}

// ============================================
// TRANSACTION-like Operations
// ============================================

/**
 * Supabase doesn't support true transactions via JS client
 * Gunakan RPC function untuk transaction logic
 * Atau gunakan ini untuk sequential operations dengan rollback on error
 */
export async function transaction(operations = []) {
  try {
    const results = [];
    for (const op of operations) {
      const result = await op();
      results.push(result);
    }
    return results;
  } catch (error) {
    // Manual rollback tidak mungkin di Supabase JS client
    // Gunakan RPC function untuk proper transactions
    throw error;
  }
}

// ============================================
// HELPERS
// ============================================

export function buildWhereClause(filters = {}) {
  const conditions = [];
  for (const [key, value] of Object.entries(filters)) {
    if (value === null) {
      conditions.push(`${key}.is.null`);
    } else if (typeof value === "string" && value.includes("%")) {
      conditions.push(`${key}.like.${value}`);
    } else {
      conditions.push(`${key}.eq.${value}`);
    }
  }
  return conditions.join(",");
}

