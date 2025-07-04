class Folder < ApplicationRecord
  has_many :cards,    dependent: :destroy
  has_many :children, class_name: "Folder",
                      foreign_key: :parent_id,
                      dependent: :destroy
  belongs_to :parent, class_name: "Folder", optional: true

  # 再帰的にツリー JSON を返す
  def as_tree_json
    {
      id: id,
      name: name,
      # 並び順が必要なら `.order(:position)` などを追加
      cards:    cards.map(&:as_json),
      children: children.map(&:as_tree_json)
    }
  end
end
