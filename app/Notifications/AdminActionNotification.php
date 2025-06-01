<?php

namespace App\Notifications;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;

class AdminActionNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $details;

    public function __construct($details)
    {
        $this->details = $details;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable)
    {
        return $this->details;
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage($this->details);
    }
}
