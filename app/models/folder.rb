class Folder < ApplicationRecord
  has_many :cards
  has_many :children, class_name: "Folder", foreign_key: "parent_id"
  belongs_to :parent, class_name: "Folder", optional: true

  def as_tree_json
    {
      id: id,
      name: name,
      cards: cards.map { |card| { id: card.id, title: card.title, body: card.body } },
      children: children.map(&:as_tree_json)
    }
  end
end
