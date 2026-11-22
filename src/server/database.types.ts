
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "animals": {
                  Row: {
                    "birth_date": string | null,"birth_date_precision": Database["public"]['Enums']["date_precision"] | null,"created_at": string,"created_by": string,"id": string,"name": string,"schema_version": number,"sex": Database["public"]['Enums']["animal_sex"] | null,"status": Database["public"]['Enums']["animal_status"],"sterilized": Database["public"]['Enums']["tri_state"] | null,"taxon_certainty": Database["public"]['Enums']["taxon_certainty"],"taxon_id": string,"updated_at": string,"updated_by": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "birth_date"?: string | null,"birth_date_precision"?: Database["public"]['Enums']["date_precision"] | null,"created_at"?: string,"created_by": string,"id"?: string,"name": string,"schema_version"?: number,"sex"?: Database["public"]['Enums']["animal_sex"] | null,"status"?: Database["public"]['Enums']["animal_status"],"sterilized"?: Database["public"]['Enums']["tri_state"] | null,"taxon_certainty"?: Database["public"]['Enums']["taxon_certainty"],"taxon_id": string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "birth_date"?: string | null,"birth_date_precision"?: Database["public"]['Enums']["date_precision"] | null,"created_at"?: string,"created_by"?: string,"id"?: string,"name"?: string,"schema_version"?: number,"sex"?: Database["public"]['Enums']["animal_sex"] | null,"status"?: Database["public"]['Enums']["animal_status"],"sterilized"?: Database["public"]['Enums']["tri_state"] | null,"taxon_certainty"?: Database["public"]['Enums']["taxon_certainty"],"taxon_id"?: string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "animals_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "parties"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "animals_taxon_id_fkey"
      columns: ["taxon_id"]
isOneToOne: false
      referencedRelation: "taxa"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "animals_updated_by_fkey"
      columns: ["updated_by"]
isOneToOne: false
      referencedRelation: "parties"
      referencedColumns: ["id"]
    }
                  ]
                },"bonds": {
                  Row: {
                    "animal_id": string,"created_at": string,"created_by": string | null,"end_reason": string | null,"ends_at": string | null,"expires_at": string | null,"id": string,"kind": Database["public"]['Enums']["bond_kind"],"origin": Database["public"]['Enums']["bond_origin"],"party_id": string,"starts_at": string,"status": Database["public"]['Enums']["bond_status"]
                  }
                  ComputedFields: never
                  Insert: {
                    "animal_id": string,"created_at"?: string,"created_by"?: string | null,"end_reason"?: string | null,"ends_at"?: string | null,"expires_at"?: string | null,"id"?: string,"kind": Database["public"]['Enums']["bond_kind"],"origin": Database["public"]['Enums']["bond_origin"],"party_id": string,"starts_at"?: string,"status": Database["public"]['Enums']["bond_status"]
                  }
                  Update: {
                    "animal_id"?: string,"created_at"?: string,"created_by"?: string | null,"end_reason"?: string | null,"ends_at"?: string | null,"expires_at"?: string | null,"id"?: string,"kind"?: Database["public"]['Enums']["bond_kind"],"origin"?: Database["public"]['Enums']["bond_origin"],"party_id"?: string,"starts_at"?: string,"status"?: Database["public"]['Enums']["bond_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "bonds_animal_id_fkey"
      columns: ["animal_id"]
isOneToOne: false
      referencedRelation: "animals"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "bonds_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "parties"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "bonds_party_id_fkey"
      columns: ["party_id"]
isOneToOne: false
      referencedRelation: "parties"
      referencedColumns: ["id"]
    }
                  ]
                },"care_groups": {
                  Row: {
                    "name_es": string,"slug": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "name_es": string,"slug": string,"sort_order": number
                  }
                  Update: {
                    "name_es"?: string,"slug"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    
                  ]
                },"parties": {
                  Row: {
                    "created_at": string,"display_name": string | null,"id": string,"kind": Database["public"]['Enums']["party_kind"],"locale": string,"time_zone": string | null,"updated_at": string,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"display_name"?: string | null,"id"?: string,"kind"?: Database["public"]['Enums']["party_kind"],"locale"?: string,"time_zone"?: string | null,"updated_at"?: string,"user_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"display_name"?: string | null,"id"?: string,"kind"?: Database["public"]['Enums']["party_kind"],"locale"?: string,"time_zone"?: string | null,"updated_at"?: string,"user_id"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"taxa": {
                  Row: {
                    "care_group": string,"catalog_version": number,"common_name_es": string,"id": string,"is_quick_pick": boolean,"parent_id": string | null,"rank": Database["public"]['Enums']["taxon_rank"],"scientific_name": string | null,"slug": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "care_group": string,"catalog_version"?: number,"common_name_es": string,"id"?: string,"is_quick_pick"?: boolean,"parent_id"?: string | null,"rank": Database["public"]['Enums']["taxon_rank"],"scientific_name"?: string | null,"slug": string,"sort_order"?: number
                  }
                  Update: {
                    "care_group"?: string,"catalog_version"?: number,"common_name_es"?: string,"id"?: string,"is_quick_pick"?: boolean,"parent_id"?: string | null,"rank"?: Database["public"]['Enums']["taxon_rank"],"scientific_name"?: string | null,"slug"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "taxa_care_group_fkey"
      columns: ["care_group"]
isOneToOne: false
      referencedRelation: "care_groups"
      referencedColumns: ["slug"]
    },{
      foreignKeyName: "taxa_parent_id_fkey"
      columns: ["parent_id"]
isOneToOne: false
      referencedRelation: "taxa"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "create_animal":
{ Args: { "p_birth_date"?: string,"p_birth_date_precision"?: Database["public"]['Enums']["date_precision"],"p_name": string,"p_sex"?: Database["public"]['Enums']["animal_sex"],"p_sterilized"?: Database["public"]['Enums']["tri_state"],"p_taxon_certainty"?: Database["public"]['Enums']["taxon_certainty"],"p_taxon_id": string }; Returns: string
                           }
          }
          Enums: {
            "animal_sex": "female"|"male"|"unknown","animal_status": "active"|"deceased"|"archived","bond_kind": "tutor"|"co_tutor"|"caregiver"|"temporary_custody"|"rescuer"|"shelter"|"adopter","bond_origin": "creation"|"invitation"|"transfer"|"claim","bond_status": "proposed"|"active"|"disputed"|"ended","date_precision": "day"|"month"|"year","party_kind": "person"|"organization","taxon_certainty": "certain"|"uncertain","taxon_rank": "kingdom"|"class"|"order"|"suborder"|"family"|"subfamily"|"genus"|"species"|"subspecies","tri_state": "yes"|"no"|"unknown"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "animal_sex": ["female", "male", "unknown"],"animal_status": ["active", "deceased", "archived"],"bond_kind": ["tutor", "co_tutor", "caregiver", "temporary_custody", "rescuer", "shelter", "adopter"],"bond_origin": ["creation", "invitation", "transfer", "claim"],"bond_status": ["proposed", "active", "disputed", "ended"],"date_precision": ["day", "month", "year"],"party_kind": ["person", "organization"],"taxon_certainty": ["certain", "uncertain"],"taxon_rank": ["kingdom", "class", "order", "suborder", "family", "subfamily", "genus", "species", "subspecies"],"tri_state": ["yes", "no", "unknown"]
          }
        }
} as const
