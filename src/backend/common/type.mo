import Principal "mo:base/Principal";
import Text "mo:base/Text";

module {
    public type EventId     = Nat;
    public type SeatId      = Nat;
    public type TicketId    = Text;
    public type InvoiceId   = Text;
    public type UserId      = Principal;
    public type Fee = {
        seller:  Nat; // service fee (6% / event -> total ticket)
        buyer: Nat; // from ticket (2% / ticket)
    }
}