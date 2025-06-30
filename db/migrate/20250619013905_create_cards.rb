class CreateCards < ActiveRecord::Migration[8.0]
  def change
    create_table :cards do |t|
      t.string :title
      t.text :body
      t.string :image_url
      t.integer :folder_id

      t.timestamps
    end
  end
end
