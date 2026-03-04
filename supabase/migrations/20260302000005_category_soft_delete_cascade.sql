-- When a menu_category is soft-deleted, cascade the soft-delete to its items.

CREATE OR REPLACE FUNCTION fn_cascade_soft_delete_category()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE menu_items
  SET deleted_at = NEW.deleted_at
  WHERE category_id = NEW.id
    AND deleted_at IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cascade_soft_delete_category
AFTER UPDATE OF deleted_at ON menu_categories
FOR EACH ROW
WHEN (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL)
EXECUTE FUNCTION fn_cascade_soft_delete_category();
