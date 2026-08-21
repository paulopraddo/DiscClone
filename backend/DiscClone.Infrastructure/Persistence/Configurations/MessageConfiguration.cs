using DiscClone.Domain.Messages;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DiscClone.Infrastructure.Persistence.Configurations;

public sealed class MessageConfiguration : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        builder.ToTable("messages");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.ChannelId)
            .HasColumnName("channel_id")
            .IsRequired();

        builder.Property(m => m.AuthorId)
            .HasColumnName("author_id")
            .IsRequired();

        builder.Property(m => m.Content)
            .HasConversion(content => content.Value, value => MessageContent.Create(value).Value)
            .HasMaxLength(MessageContent.MaxLength)
            .HasColumnName("content")
            .IsRequired();

        builder.Property(m => m.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(m => m.EditedAt)
            .HasColumnName("edited_at");

        builder.HasIndex(m => m.ChannelId);
    }
}
