-- When a menu is soft-deleted, cascade the soft-delete to its categories and items.

CREATE OR REPLACE FUNCTION fn_cascade_soft_delete_menu()
RETURNS TRIGGER AS $$
BEGIN
  -- soft-delete all categories belonging to this menu
  UPDATE menu_categories
  SET deleted_at = NEW.deleted_at
  WHERE menu_id = NEW.id
    AND deleted_at IS NULL;

  -- soft-delete all items belonging to those categories
  UPDATE menu_items
  SET deleted_at = NEW.deleted_at
  WHERE category_id IN (
    SELECT id FROM menu_categories WHERE menu_id = NEW.id
  )
  AND deleted_at IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cascade_soft_delete_menu
AFTER UPDATE OF deleted_at ON menus
FOR EACH ROW
WHEN (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL)
EXECUTE FUNCTION fn_cascade_soft_delete_menu();
