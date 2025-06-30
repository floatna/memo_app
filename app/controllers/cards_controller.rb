class CardsController < ApplicationController
  before_action :set_card, only: %i[ show update destroy ]

  # GET /cards
  def index
    @cards = if params[:folder_id]
               Card.where(folder_id: params[:folder_id])
             else
               Card.all
             end

    render json: @cards.as_json(methods: [:image_url])
  end

  # GET /cards/1
  def show
    render json: @card.as_json(methods: [:image_url])
  end

  # POST /cards
  def create
    @card = Card.new(card_params)

    if @card.save
      render json: @card.as_json(methods: [:image_url]), status: :created, location: @card
    else
      render json: @card.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /cards/1
  def update
    if @card.update(card_params)
      render json: @card.as_json(methods: [:image_url])
    else
      render json: @card.errors, status: :unprocessable_entity
    end
  end

  # DELETE /cards/1
  def destroy
    @card.destroy!
  end

  private

  def set_card
    @card = Card.find(params[:id])
  end

  # ✅ ここが重要！画像を受け付けるために :image を許可する
  def card_params
    params.require(:card).permit(:title, :body, :folder_id, :image)
  end
end
