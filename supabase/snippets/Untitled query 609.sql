-- menus
CREATE POLICY "staff_update_menu"
  ON menus FOR UPDATE
  USING (restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE id = auth.uid()))
  WITH CHECK (restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "staff_delete_menu"
  ON menus FOR DELETE
  USING (restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE id = auth.uid()));

-- menu_categories
CREATE POLICY "staff_update_category"
  ON menu_categories FOR UPDATE
  USING (restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE id = auth.uid()))
  WITH CHECK (restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "staff_delete_category"
  ON menu_categories FOR DELETE
  USING (restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE id = auth.uid()));

-- menu_items
CREATE POLICY "staff_update_menu_item"
  ON menu_items FOR UPDATE
  USING (restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE id = auth.uid()))
  WITH CHECK (restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "staff_delete_menu_item"
  ON menu_items FOR DELETE
  USING (restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE id = auth.uid()));