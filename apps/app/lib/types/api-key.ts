export interface ApiKey {
	key_id: string;
	name: string;
	key_prefix: string;
	is_active: boolean;
	expires_at: string | null;
	last_used_at: string | null;
	created_at: string;
	space_id: string | null;
}

export interface CreateApiKeyResponse {
	key_id: string;
	name: string;
	key_prefix: string;
	raw_key: string;
	expires_at: string | null;
	space_id: string | null;
}

export interface ListApiKeysResponse {
	keys: ApiKey[];
}
