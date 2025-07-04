class Card < ApplicationRecord
  has_one_attached :image

  # 画像 URL（未添付なら nil）
  def image_url
    return unless image.attached?

    # /rails/active_storage～ の相対パスを返す
    Rails.application.routes.url_helpers.rails_blob_url(image, only_path: true)
  end

  # ➜ JSON に image_url を含める
  def as_json(options = {})
    super({ only: %i[id title body] }.merge(options)).merge(image_url: image_url)
  end
end
