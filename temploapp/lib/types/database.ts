export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "admin" | "user";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string; role: AppRole; created_at: string };
        Insert: { id: string; full_name: string; role?: AppRole; created_at?: string };
        Update: { full_name?: string; role?: AppRole };
        Relationships: [];
      };
      items: {
        Row: {
          id: string;
          name: string;
          normalized_name: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          normalized_name?: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: { name?: string; normalized_name?: string; updated_at?: string };
        Relationships: [
          {
            foreignKeyName: "items_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_items: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          assigned_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_id: string;
          assigned_by: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "user_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_items_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: true;
            referencedRelation: "items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_items_assigned_by_fkey";
            columns: ["assigned_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      select_own_item: {
        Args: { target_item_id: string };
        Returns: { user_id: string; item_id: string }[];
      };
      reassign_item: {
        Args: { target_item_id: string; target_user_id: string };
        Returns: { user_id: string; item_id: string; changed: boolean }[];
      };
      change_profile_role: {
        Args: { target_profile_id: string; new_role: AppRole };
        Returns: { id: string; role: AppRole; changed: boolean }[];
      };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      normalize_item_name: { Args: { value: string }; Returns: string };
    };
    Enums: { app_role: AppRole };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Item = Database["public"]["Tables"]["items"]["Row"];
export type UserItem = Database["public"]["Tables"]["user_items"]["Row"];

export type ItemWithSelection = Item & {
  selection_count: number;
  is_selected: boolean;
  is_available: boolean;
  assigned_profile: Pick<Profile, "id" | "full_name"> | null;
};
