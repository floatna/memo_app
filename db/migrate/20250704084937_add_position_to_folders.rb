class AddPositionToFolders < ActiveRecord::Migration[8.0]
  def change
    add_column :folders, :position, :integer
  end
end
